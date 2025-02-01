import { Page, PageAsset } from 'definitions';
import tsup from 'tsup';
import { join, format, parse } from 'node:path';
import { IPlugin } from '../IPlugin';
import { isType, match } from 'variant';
import { MdImport } from '../../services/md/mdTypes';
import { existsSync } from 'node:fs';
import { copyFile } from 'node:fs/promises';
import { HtmlAsset } from 'html-generator';

const importRegex = /import.+from\s+['"]([^'";]+)['"];?/gm;

export class MdImportsPlugin implements IPlugin {
  private pageAssets: Map<string, PageAsset[]> = new Map();

  constructor() {}

  private _processAdjacentCss(page: Page, importItem: MdImport) {
    const cssPath = format({
      ...parse(importItem.targetImportPath),
      base: '',
      ext: '.css',
    });

    if (existsSync(cssPath)) {
      this.pageAssets.set(page.relativePath, [
        ...(this.pageAssets.get(page.relativePath) || []),
        PageAsset.css({
          path: cssPath,
        }),
      ]);
    }
  }

  async processRaw(page: Page, content: string): Promise<string | undefined> {
    if (isType(page, 'md')) {
      const imports: MdImport[] = [];
      let m = importRegex.exec(content);
      while (m != null) {
        const importPath = m[1];
        imports.push({
          statement: m[0],
          importPath,
          targetImportPath: format({
            ...parse(join('target', 'md', 'src', importPath)),
            base: '',
            ext: '.js',
          }),
          positionIdx: m.index,
          mdFilePath: page.path,
        });
        m = importRegex.exec(content);
      }

      if (imports.length > 0) {
        await tsup.build({
          entry: imports.map((item) => {
            return join('src', item.importPath);
          }),
          esbuildOptions(options) {
            // the directory structure will be the same as the source
            options.outbase = './';
          },
          format: ['esm'],
          outDir: join('target', 'md'),
          external: ['react', 'react-dom'],
        });
      }

      for (const importItem of imports) {
        content = content.replace(
          importItem.importPath,
          `./${importItem.targetImportPath}`,
        );
        this._processAdjacentCss(page, importItem);
      }

      return content;
    }
    return undefined;
  }

  async postEval(page: Page, buildPostDir: string) {
    const assets = this.pageAssets.get(page.relativePath) || [];
    const htmlAssets: Array<HtmlAsset> = [];
    for (const asset of assets) {
      htmlAssets.push(
        match(asset, {
          css: () => {
            const fileParts = parse(asset.path);
            const fileName = `${fileParts.name}${fileParts.ext}`;
            const buildAssetPath = join(buildPostDir, fileName);
            copyFile(join('./', asset.path), buildAssetPath);
            return HtmlAsset.css({
              linkHref: fileName,
            });
          },
        }),
      );
    }
    return {
      htmlAssets,
    };
  }
}
