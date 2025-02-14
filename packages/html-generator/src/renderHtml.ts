import ejs from 'ejs';
import pageTemplate from './templates/page';
import { HtmlAsset } from './types';

export interface PageData {
  pageTitle: string;
  metaDescription: string;
  content: string;
  assets: Array<HtmlAsset>;
}

export const renderHtmlOfPage = async (data: PageData): Promise<string> => {
  return ejs.render(pageTemplate, data, { async: true });
};
