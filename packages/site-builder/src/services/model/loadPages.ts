import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, sep, extname } from 'node:path';
import { globby } from 'globby';
import { pageConfigSchema, Page, PAGE_CONFIG_FILE, EXCERPT_FILE, THUMBNAIL_FILE_PATTERN, PAGES_DIR } from 'definitions';
import { BuildError } from 'error-reporter';

const loadPageConfig = async (postPath: string) => {
  const configPath = join(dirname(postPath), PAGE_CONFIG_FILE);
  if (!existsSync(configPath)) {
    throw new BuildError(`Config file doesn't exist for "${postPath}"`);
  }
  const rawConfig = await readFile(configPath, 'utf8');
  return pageConfigSchema.parse(JSON.parse(rawConfig));
};

const getExcerptPath = (pagePath: string) => {
  const excerptPathDraft = join(dirname(pagePath), EXCERPT_FILE);
  return existsSync(excerptPathDraft) ? excerptPathDraft : undefined;
};

const loadThumbnailPath = async (pagePath: string) => {
  const files = await globby(THUMBNAIL_FILE_PATTERN, {
    cwd: dirname(pagePath),
  });

  if (files.length > 1) {
    throw new BuildError(`You can have only one thumbnail, got ${files.length}:
${files.join('\n')}`);
  }

  return files[0];
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

    const excerptPath = getExcerptPath(path);
    const thumbnailPath = await loadThumbnailPath(path);

    switch (ext) {
      case 'md':
        posts.push(
          Page.md({
            path,
            route,
            relativePath,
            excerptPath,
            thumbnailPath,
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
            thumbnailPath,
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
