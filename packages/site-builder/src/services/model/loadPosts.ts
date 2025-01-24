import { readFile } from 'node:fs/promises';
import { dirname, join, sep } from 'node:path';
import { globby } from 'globby';
import { pageConfigSchema, type Page } from 'definitions';
import { PAGE_CONFIG_FILE, PAGES_DIR } from '../../constants';

const loadPageConfig = async (postPath: string) => {
  const rawConfig = await readFile(
    join(dirname(postPath), PAGE_CONFIG_FILE),
    'utf8',
  );
  return pageConfigSchema.parse(JSON.parse(rawConfig));
};

export const loadPages = async (cwd: string): Promise<Array<Page>> => {
  const pathPattern = `${PAGES_DIR}/*/index.md`;
  const mdFiles = await globby(pathPattern, {
    cwd,
  });

  if (mdFiles.length === 0) {
    throw new Error(`There are no pages for pattern "${pathPattern}"`);
  }

  const posts: Array<Page> = [];

  for (const path of mdFiles) {
    // I want blog posts to be flat in the `build/` folder
    // This is way I'll need only to copy them as is in `blog/` folder
    const relativePath = path.replace(new RegExp(`^${PAGES_DIR}${sep}`), '');
    posts.push({
      path,
      relativePath,
      config: await loadPageConfig(path),
    });
  }

  return posts;
};
