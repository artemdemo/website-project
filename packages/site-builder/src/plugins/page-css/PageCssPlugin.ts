import { Page } from 'definitions';
import { existsSync } from 'node:fs';
import { join, format, parse } from 'node:path';
import { IPlugin, PostEvalResult } from '../IPlugin';

export class PageCssPlugin implements IPlugin {
  async processRaw(_page: Page, _content: string): Promise<string | undefined> {
    return undefined;
  }

  async postEval(
    page: Page,
    buildPageDir: string,
  ): Promise<Partial<PostEvalResult>> {
    // console.log('>> buildPageDir', buildPageDir);
    // const cssPath = join(
    //   buildPageDir,
    //   format({
    //     ...parse(page.relativePath),
    //     base: '',
    //     ext: '.css',
    //   }),
    // );
    // if (existsSync(cssPath)) {}
    return {};
  }
}
