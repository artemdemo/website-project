import { readFile } from 'node:fs/promises';
import { Post } from './model/loadPosts';

export const readFullPostContent = async (post: Post): Promise<string> => {
  const rawContent = await readFile(post.path, 'utf8');
  return rawContent.replaceAll(/<!--.+-->/g, '');
};
