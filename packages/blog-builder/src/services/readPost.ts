import type { Post } from 'definitions';
import { readFile } from 'node:fs/promises';

export const readFullPostContent = async (post: Post): Promise<string> => {
  const rawContent = await readFile(post.path, 'utf8');
  return rawContent.replaceAll(/<!--.+-->/g, '');
};
