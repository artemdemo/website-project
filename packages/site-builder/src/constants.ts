import { join } from 'node:path';

export const BUILD_DIR = 'build';
export const TARGET_DIR = 'target';
export const ASSETS_DIR = '_assets';

export const BUILD_ASSETS_DIR = join(BUILD_DIR, ASSETS_DIR);

const CONTENT_DIR = 'src';
export const PAGES_DIR = join(CONTENT_DIR, 'pages');

// ToDo: Every variable below has "file" in its name.
// Update it.

export const SITE_CONFIG_FILE = 'site.config.json';

export const PAGE_CONFIG_FILE = 'index.json';
