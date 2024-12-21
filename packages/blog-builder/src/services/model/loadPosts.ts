import { z } from 'zod';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { globby } from 'globby';
import { POST_CONFIG_FILE, POSTS_DIR } from '../../constants';

const postConfigSchema = z.object({
  title: z.string(),
  date: z.string(),
  featuredImage: z.string(),
  tags: z.array(z.string()),
});

type PostConfig = z.infer<typeof postConfigSchema>;

export interface Post {
  path: string;
  config: PostConfig;
}

const loadPostConfig = async (postPath: string) => {
  const rawConfig = await readFile(join(dirname(postPath), POST_CONFIG_FILE), 'utf8');
  return postConfigSchema.parse(JSON.parse(rawConfig));
};

export const loadPosts = async (cwd: string): Promise<Array<Post>> => {
  const mdFiles = await globby(`${POSTS_DIR}/*/index.md`, {
    cwd,
  });

  const posts: Array<Post> = [];

  for (const path of mdFiles) {
    posts.push({
      path,
      config: await loadPostConfig(path),
    });
  }

  return posts;
};
