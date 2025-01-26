import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import ejs from 'ejs';
import { HtmlAsset } from './types';

export interface PageData {
  pageTitle: string;
  metaDescription: string;
  content: string;
  assets: Array<HtmlAsset>;
}

export const renderHtmlOfPage = async (data: PageData): Promise<string> => {
  const template = await readFile(
    join(import.meta.dirname, '../templates/page.ejs'),
    {
      encoding: 'utf8',
    },
  );
  return ejs.render(template, data, { async: true });
};
