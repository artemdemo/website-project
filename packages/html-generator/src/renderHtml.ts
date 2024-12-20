import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import ejs from 'ejs';
import { BlogPageData } from './types.js';

export const renderHtmlOfBlogPage = async (data: BlogPageData): Promise<string> => {
  const template = await readFile(
    join(import.meta.dirname, '../templates/blog-page.ejs'),
    {
      encoding: 'utf8',
    },
  );
  return ejs.render(template, data, { async: true });
};
