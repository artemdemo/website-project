import { join } from 'node:path';

export const BUILD_DIR = 'build';
export const TARGET_DIR = 'target';

const CONTENT_DIR = 'src';
export const PAGES_DIR = join(CONTENT_DIR, 'pages');

// ToDo: Every variable below has "file" in its name.
// Update it.

export const SITE_CONFIG_FILE = 'site.config.json';

export const PAGE_CONFIG_FILE = 'index.json';
