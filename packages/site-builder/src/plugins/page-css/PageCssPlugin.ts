import { Page } from 'definitions';
import { existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { HtmlAsset } from 'html-generator';
import { IPlugin, PostEvalResult, RawProcessData } from '../IPlugin';
import { replaceExt } from '../../services/fs';
import { isType } from 'variant';
import { ASSETS_DIR, BUILD_ASSETS_DIR } from '../../constants';

const bgUrlRegex = /url\("?([^"'\s]+)"?\);/gm;

export class PageCssPlugin implements IPlugin {
  private _cssMap: WeakMap<
    Page,
    {
      fileName: string;
      targetPath: string;
      urlPathList: string[];
    }
  > = new WeakMap();

  async processRaw(
    page: Page,
    _rawProcessData: RawProcessData,
    targetPageDir: string,
  ) {
    if (isType(page, 'tsx')) {
      const fileName = replaceExt(basename(page.relativePath), '.css');
      const cssTargetPath = join(targetPageDir, fileName);
      if (existsSync(cssTargetPath)) {
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
          fileName: fileName,
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
    }
    return {};
  }

  async postEval(
    page: Page,
    buildPageDir: string,
  ): Promise<Partial<PostEvalResult>> {
    const htmlAssets: Array<HtmlAsset> = [];
    const cssData = this._cssMap.get(page);
    if (cssData) {
      console.log(cssData);
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
