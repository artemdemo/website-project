import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { SiteConfig } from 'definitions';
import { SITE_CONFIG_FILE, siteConfigSchema } from 'definitions';

export const loadBlogConfig = async (cwd: string): Promise<SiteConfig> => {
  const rawConfig = await readFile(join(cwd, SITE_CONFIG_FILE), 'utf8');
  return siteConfigSchema.parseAsync(JSON.parse(rawConfig));
};
