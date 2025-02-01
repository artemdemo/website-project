import { Page } from 'definitions';
import { HtmlAsset } from 'html-generator';

export type PostEvalResult = {
  htmlAssets: Array<HtmlAsset>;
};

export type RawProcessData = {
  content: string;
  targetCssPathList: string[];
};

export interface IPlugin {
  processRaw(
    page: Page,
    rawProcessData: RawProcessData,
    targetPageDir: string,
  ): Promise<Partial<RawProcessData>>;
  postEval(page: Page, buildPageDir: string): Promise<Partial<PostEvalResult>>;
}
