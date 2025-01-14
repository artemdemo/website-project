import { z } from 'zod';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SITE_CONFIG_FILE } from '../../constants';

const blogConfigSchema = z.object({
  titlePrefix: z.string(),
  metaDescription: z.string(),
});

export type BlogConfig = z.infer<typeof blogConfigSchema>;

export const loadBlogConfig = async (cwd: string): Promise<BlogConfig> => {
  const rawConfig = await readFile(join(cwd, SITE_CONFIG_FILE), 'utf8');
  return blogConfigSchema.parseAsync(JSON.parse(rawConfig));
};
