import { globby } from 'globby';
import { POSTS_DIR } from '../../constants';

export interface Post {
  path: string;
}

export const loadPosts = async (cwd: string): Promise<Array<Post>> => {
  const mdFiles = await globby(`${POSTS_DIR}/*/index.md`, {
    cwd,
  });

  const posts: Array<Post> = [];

  for (const path of mdFiles) {
    posts.push({
      path,
    });
  }

  return posts;
};
