import {
  BUILD_ASSETS_DIR,
  CONTENT_DIR,
  SITE_RENDER_TS,
  SiteRendererFn,
  TARGET_DIR,
} from '@artemdemo/definitions';
import { replaceExt } from '@artemdemo/fs-utils';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import tsup from 'tsup';
import { importJS } from './importJS';
import { copyFile } from 'node:fs/promises';

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
const SITE_RENDER_CSS = replaceExt(SITE_RENDER_TS, '.css');

export class SiteRenderFactory {
  private _cwd: string;
  private _cssAssetsPath: string;
  private _siteRenderData: ReturnType<SiteRendererFn> | undefined;

  constructor(cwd: string) {
    this._cwd = cwd;
    this._cssAssetsPath = join(this._cwd, BUILD_ASSETS_DIR, SITE_RENDER_CSS);
  }

  async load(): Promise<ReturnType<SiteRendererFn>> {
    if (this._siteRenderData) {
      return Promise.resolve(this._siteRenderData);
    }

    if (existsSync(join(this._cwd, SITE_RENDER_TS_FULL_PATH))) {
      await tsup.build({
        entry: [SITE_RENDER_TS_FULL_PATH],
        format: ['esm'],
        outDir: TARGET_DIR,
        external: ['react', 'react-dom'],
      });
    }
    try {
      const result = await importJS(
        join(this._cwd, TARGET_DIR, SITE_RENDER_JS),
      );
      this._siteRenderData = result.default() as ReturnType<SiteRendererFn>;
      await this._processCss();
    } catch (e) {
      this._siteRenderData = {};
    }

    return this._siteRenderData;
  }

  private async _processCss() {
    const cssTargetPath = join(this._cwd, TARGET_DIR, SITE_RENDER_CSS);
    if (existsSync(cssTargetPath)) {
      await copyFile(cssTargetPath, this._cssAssetsPath);
    }
  }

  getAssetsCss(): string | undefined {
    if (existsSync(this._cssAssetsPath)) {
      return this._cssAssetsPath;
    }
  }
}
