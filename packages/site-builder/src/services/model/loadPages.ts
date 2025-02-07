import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, sep, extname } from 'node:path';
import { globby } from 'globby';
import { pageConfigSchema, Page } from 'definitions';
import { PAGE_CONFIG_FILE, PAGES_DIR } from '../../constants';
import { BuildError } from 'error-reporter';

const loadPageConfig = async (postPath: string) => {
  const rawConfig = await readFile(
    join(dirname(postPath), PAGE_CONFIG_FILE),
    'utf8',
  );
  return pageConfigSchema.parse(JSON.parse(rawConfig));
};

export const loadPages = async (cwd: string): Promise<Array<Page>> => {
  const pathPattern = [
    `${PAGES_DIR}/index.(md|tsx)`,
    `${PAGES_DIR}/**/index.(md|tsx)`,
  ];
  const files = await globby(pathPattern, {
    cwd,
  });

  if (files.length === 0) {
    throw new BuildError(`There are no pages for pattern "${pathPattern}"`);
  }

  const posts: Array<Page> = [];

  for (const path of files) {
    // I want blog posts to be flat in the `build/` folder
    // This is way I'll need only to copy them as is in `blog/` folder
    const relativePath = path.replace(new RegExp(`^${PAGES_DIR}${sep}`), '');
    const ext = extname(relativePath).replace('.', '');

    const route = '/' + relativePath.split(sep).slice(0, -1).join('/');

    const excerptPathDraft = join(dirname(path), 'excerpt.md');
    const excerptPath = existsSync(excerptPathDraft) ? excerptPathDraft : undefined;

    switch (ext) {
      case 'md':
        posts.push(
          Page.md({
            path,
            route,
            relativePath,
            excerptPath,
            config: await loadPageConfig(path),
          }),
        );
        break;
      case 'tsx':
        posts.push(
          Page.tsx({
            path,
            route,
            relativePath,
            excerptPath,
            config: await loadPageConfig(path),
          }),
        );
        break;
      default:
        throw new BuildError(
          `Not supported file extension "${ext}" in "${relativePath}"`,
        );
    }
  }

  return posts;
};
