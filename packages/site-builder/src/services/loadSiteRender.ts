import {
  CONTENT_DIR,
  SITE_RENDER_TS,
  SiteRendererFn,
  TARGET_DIR,
} from 'definitions';
import { replaceExt } from 'fs-utils';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import tsup from 'tsup';
import { importJS } from './importJS';

// function isSiteRenderFn(data: unknown): data is { default: SiteRendererFn } {
//   return (
//     data != null &&
//     typeof data === 'object' &&
//     'default' in data &&
//     data.default != null &&
//     typeof data.default === 'object' &&
//     'pageWrapper' in data.default &&
//     typeof data.default.pageWrapper === 'function'
//   );
// }

const SITE_RENDER_TS_FULL_PATH = join(CONTENT_DIR, SITE_RENDER_TS);
const SITE_RENDER_JS = replaceExt(SITE_RENDER_TS, '.js');

export const loadSiteRender = async (
  cwd: string,
): Promise<ReturnType<SiteRendererFn>> => {
  if (existsSync(join(cwd, SITE_RENDER_TS_FULL_PATH))) {
    await tsup.build({
      entry: [SITE_RENDER_TS_FULL_PATH],
      format: ['esm'],
      outDir: TARGET_DIR,
      external: ['react', 'react-dom'],
    });
  }
  try {
    const result = await importJS(join(cwd, TARGET_DIR, SITE_RENDER_JS));

    return result.default() as ReturnType<SiteRendererFn>;
  } catch (e) {
    // nothing
  }

  return {};
};
