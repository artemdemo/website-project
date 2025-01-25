import type { Page } from 'definitions';
import { readFile } from 'node:fs/promises';

export const readFullPostContent = async (post: Page): Promise<string> => {
  const rawContent = await readFile(post.path, 'utf8');
  return rawContent.replaceAll(/<!--.+-->/g, '');
};
