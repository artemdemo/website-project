import { readFile } from 'node:fs/promises';
import { dirname, join, sep } from 'node:path';
import { globby } from 'globby';
import { postConfigSchema, type Post } from 'definitions';
import { POST_CONFIG_FILE, POSTS_DIR } from '../../constants';

const loadPostConfig = async (postPath: string) => {
  const rawConfig = await readFile(
    join(dirname(postPath), POST_CONFIG_FILE),
    'utf8',
  );
  return postConfigSchema.parse(JSON.parse(rawConfig));
};

export const loadPosts = async (cwd: string): Promise<Array<Post>> => {
  const pathPattern = `${POSTS_DIR}/*/index.md`;
  const mdFiles = await globby(pathPattern, {
    cwd,
  });

  if (mdFiles.length === 0) {
    throw new Error(`There are no posts for pattern "${pathPattern}"`);
  }

  const posts: Array<Post> = [];

  for (const path of mdFiles) {
    // I want blog posts to be flat in the `build/` folder
    // Thisway I'll need only to copy them as is in `blog/` folder,
    // when I'll be ready to publish
    const relativePath = path.replace(new RegExp(`^${POSTS_DIR}${sep}`), '');
    posts.push({
      path,
      relativePath,
      config: await loadPostConfig(path),
    });
  }

  return posts;
};
