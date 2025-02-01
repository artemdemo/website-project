import { Page } from 'definitions';
import { existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import { IPlugin, PostEvalResult, RawProcessData } from '../IPlugin';
import { replaceExt } from '../../services/fs';
import { isType } from 'variant';
import { CssProcessor } from '../../services/CssProcessor';

export class PageCssPlugin implements IPlugin {
  private _cssProcessor = new CssProcessor();

  async processRaw(
    page: Page,
    _rawProcessData: RawProcessData,
    targetPageDir: string,
  ) {
    if (isType(page, 'tsx')) {
      const fileName = replaceExt(basename(page.relativePath), '.css');
      const cssTargetPath = join(targetPageDir, fileName);

      if (existsSync(cssTargetPath)) {
        await this._cssProcessor.process(page, fileName, cssTargetPath);
      }
    }
    return {};
  }

  async postEval(
    page: Page,
    buildPageDir: string,
  ): Promise<Partial<PostEvalResult>> {
    return await this._cssProcessor.postEval(page, buildPageDir);
  }
}
