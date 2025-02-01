import { Page } from 'definitions';
import { HtmlAsset } from 'html-generator';

export type PostEvalResult = {
  htmlAssets: Array<HtmlAsset>;
};

export interface IPlugin {
  processRaw(page: Page, content: string): Promise<string | undefined>;
  postEval(
    page: Page,
    buildPageDir: string,
    targetPageDir: string,
  ): Promise<Partial<PostEvalResult>>;
}
