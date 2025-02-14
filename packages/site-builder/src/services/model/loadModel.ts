import type { Page, SiteConfig } from 'definitions';
import { loadBlogConfig } from './loadSiteConfig';
import { loadPages } from './loadPages';

export interface Model {
  pages: Array<Page>;
  config: SiteConfig;
}

export const loadModel = async (cwd: string): Promise<Model> => {
  return {
    pages: await loadPages(cwd),
    config: await loadBlogConfig(cwd),
  };
};
