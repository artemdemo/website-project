import { Page, TARGET_DIR } from '@artemdemo/definitions';
import tsup from 'tsup';
import { join, basename } from 'node:path';
import { IPlugin, RawProcessData } from '../IPlugin';
import { isType } from 'variant';
import { existsSync } from 'node:fs';
import { replaceExt } from '@artemdemo/fs-utils';
import { CssProcessor } from '../../services/CssProcessor';

type MdImport = {
  importPath: string;
  targetImportPath: string;
  statement: string;
  positionIdx: number;
  mdFilePath: string;
};

const importRegex = /import.+from\s+['"]([^'";]+)['"];?/gm;

export class MdImportsPlugin implements IPlugin {
  private _cssProcessor = new CssProcessor();

  async processRaw(page: Page, { content }: RawProcessData) {
    if (isType(page, 'md')) {
      const imports: MdImport[] = [];
      let m = importRegex.exec(content);
      while (m != null) {
        const importPath = m[1];
        imports.push({
          statement: m[0],
          importPath,
          targetImportPath: replaceExt(
            join(TARGET_DIR, 'md', 'src', importPath),
            '.js',
          ),
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
          outDir: join(TARGET_DIR, 'md'),
          external: ['react', 'react-dom'],
        });
      }

      for (const importItem of imports) {
        content = content.replace(
          importItem.importPath,
          `./${importItem.targetImportPath}`,
        );
        const cssPath = replaceExt(importItem.targetImportPath, '.css');

        if (existsSync(cssPath)) {
          await this._cssProcessor.process(page, basename(cssPath), cssPath);
        }
      }

      return {
        content,
      };
    }
    return {};
  }

  async postEval(page: Page, buildPageDir: string) {
    return await this._cssProcessor.postEval(page, buildPageDir);
  }
}
