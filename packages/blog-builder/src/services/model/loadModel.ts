import { BlogConfig, loadBlogConfig } from './loadBlogConfig';
import { loadPosts, Post } from './loadPosts';

export interface Model {
  posts: Array<Post>;
  config: BlogConfig;
}

export const loadModel = async (cwd: string): Promise<Model> => {
  return {
    posts: await loadPosts(cwd),
    config: await loadBlogConfig(cwd),
  };
};
