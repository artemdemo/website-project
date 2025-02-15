import {
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
import { CssProcessor } from './CssProcessor';
import { HtmlAsset } from '@artemdemo/html-generator';

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
  private _htmlAssets: Array<HtmlAsset> = [];
  private _siteRenderData: ReturnType<SiteRendererFn> | undefined;
  private _cssProcessor: CssProcessor;

  constructor(cwd: string) {
    this._cwd = cwd;
    this._cssProcessor = new CssProcessor();
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
      await this._cssProcessor.process(
        SITE_RENDER_TS,
        SITE_RENDER_CSS,
        join(this._cwd, TARGET_DIR, SITE_RENDER_CSS),
      );
      const { htmlAssets } = await this._cssProcessor.postEval(SITE_RENDER_TS);
      this._htmlAssets = htmlAssets;
    } catch (e) {
      this._siteRenderData = {};
    }

    return this._siteRenderData;
  }

  getHtmlAssets() {
    return this._htmlAssets;
  }
}
