import { Page } from 'definitions';
import { existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import { copyFile } from 'node:fs/promises';
import { HtmlAsset } from 'html-generator';
import { IPlugin, PostEvalResult } from '../IPlugin';
import { replaceExt } from '../../services/fs';

export class PageCssPlugin implements IPlugin {
  async processRaw(_page: Page, _content: string): Promise<string | undefined> {
    return undefined;
  }

  async postEval(
    page: Page,
    buildPageDir: string,
    targetPageDir: string,
  ): Promise<Partial<PostEvalResult>> {
    const htmlAssets: Array<HtmlAsset> = [];
    const filePath = replaceExt(basename(page.relativePath), '.css');
    const cssTargetPath = join(targetPageDir, filePath);
    if (existsSync(cssTargetPath)) {
      const cssBuildPath = join(buildPageDir, filePath);

      await copyFile(cssTargetPath, cssBuildPath);
      htmlAssets.push(
        HtmlAsset.css({
          linkHref: filePath,
        }),
      );
    }
    return {
      htmlAssets,
    };
  }
}
