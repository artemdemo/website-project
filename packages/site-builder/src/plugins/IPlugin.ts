import { Page } from '@artemdemo/definitions';
import { HtmlAsset } from '@artemdemo/html-generator';

export type PostEvalResult = {
  htmlAssets: Array<HtmlAsset>;
};

export type RawProcessData = {
  content: string;
};

export interface IPlugin {
  processRaw(
    page: Page,
    rawProcessData: RawProcessData,
    targetPageDir: string,
  ): Promise<Partial<RawProcessData>>;
  postEval(page: Page, buildPageDir: string): Promise<Partial<PostEvalResult>>;
}
