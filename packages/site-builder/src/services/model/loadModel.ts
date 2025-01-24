import type { Page } from 'definitions';
import { BlogConfig, loadBlogConfig } from './loadBlogConfig';
import { loadPages } from './loadPosts';

export interface Model {
  pages: Array<Page>;
  config: BlogConfig;
}

export const loadModel = async (cwd: string): Promise<Model> => {
  return {
    pages: await loadPages(cwd),
    config: await loadBlogConfig(cwd),
  };
};
