import { Page } from 'definitions';
import { HtmlAsset } from 'html-generator';

export type PostEvalResult = {
  htmlAssets: Array<HtmlAsset>;
};

export interface IPlugin {
  processRaw(
    page: Page,
    content: string,
    targetPageDir: string,
  ): Promise<string | undefined>;
  postEval(page: Page, buildPageDir: string): Promise<Partial<PostEvalResult>>;
}
