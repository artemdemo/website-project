import { CONTENT_DIR, SiteRendererFn, TARGET_DIR } from 'definitions';
import { replaceExt } from 'fs-utils';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import tsup from 'tsup';

function isSiteRenderFn(data: unknown): data is { default: SiteRendererFn } {
  return (
    data != null &&
    typeof data === 'object' &&
    'default' in data &&
    data.default != null &&
    typeof data.default === 'object' &&
    'pageWrapper' in data.default &&
    typeof data.default.pageWrapper === 'function'
  );
}

const SITE_RENDER_TS = 'site.render.ts';
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
    const result: unknown = await import(join(cwd, TARGET_DIR, SITE_RENDER_JS));

    if (isSiteRenderFn(result)) {
      return result.default();
    }
  } catch (e) {
    // nothing
  }

  return {};
};
