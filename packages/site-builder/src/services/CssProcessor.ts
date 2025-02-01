import { Page } from 'definitions';
import { basename, join } from 'node:path';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { ASSETS_DIR, BUILD_ASSETS_DIR } from '../constants';
import { HtmlAsset } from 'html-generator';

const bgUrlRegex = /url\("?([^"'\s]+)"?\);/gm;

export class CssProcessor {
  private _cssMap: WeakMap<
    Page,
    {
      fileName: string;
      targetPath: string;
      urlPathList: string[];
    }
  > = new WeakMap();

  async process(page: Page, fileName: string, cssTargetPath: string) {
    const cssContent = await readFile(cssTargetPath, {
      encoding: 'utf8',
    });
    let match = bgUrlRegex.exec(cssContent);
    const urlList: string[] = [];
    while (match !== null) {
      if (match.index === bgUrlRegex.lastIndex) {
        bgUrlRegex.lastIndex++;
      }
      urlList.push(match[1]);
      match = bgUrlRegex.exec(cssContent);
    }
    this._cssMap.set(page, {
      fileName,
      targetPath: cssTargetPath,
      urlPathList: urlList.map((relativePath) => {
        return join(
          cssTargetPath.split('/').slice(0, -1).join('/'),
          relativePath,
        );
      }),
    });
    if (urlList.length > 0) {
      let updatedCssContent: string = cssContent;
      for (const urlPath of urlList) {
        updatedCssContent = updatedCssContent.replace(
          urlPath,
          `/./${ASSETS_DIR}/${basename(urlPath)}`,
        );
      }
      await writeFile(cssTargetPath, updatedCssContent, {
        encoding: 'utf8',
      });
    }
  }

  async postEval(page: Page, buildPageDir: string) {
    const htmlAssets: Array<HtmlAsset> = [];
    const cssData = this._cssMap.get(page);
    if (cssData) {
      const cssBuildPath = join(buildPageDir, cssData.fileName);
      await copyFile(cssData.targetPath, cssBuildPath);

      for (const urlPath of cssData.urlPathList) {
        await copyFile(urlPath, join(BUILD_ASSETS_DIR, basename(urlPath)));
      }

      htmlAssets.push(
        HtmlAsset.css({
          linkHref: cssData.fileName,
        }),
      );
    }
    return {
      htmlAssets,
    };
  }
}
