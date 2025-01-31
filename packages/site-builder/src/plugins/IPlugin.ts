import { Page } from 'definitions';
// import * as mdx from '@mdx-js/mdx';
import { HtmlAsset } from 'html-generator';

export interface IPlugin {
  processRaw(page: Page, content: string): Promise<string | undefined>;
  postEval(
    page: Page,
    buildPostDir: string,
    // evaluated: Awaited<ReturnType<typeof mdx.evaluate>>,
  ): Promise<HtmlAsset[]>;
}
