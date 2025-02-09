import tsup from 'tsup';
import { dirname, join, sep } from 'node:path';
import { Page, SiteRendererFn } from 'definitions';
import { BuildError } from 'error-reporter';
import { EvalService } from './EvalService';
import { BUILD_DIR, TARGET_PAGES_DIR } from '../constants';
import { renderHtmlOfPage } from 'html-generator';
import { getAppContext } from './context';
import { mkdir, writeFile } from 'node:fs/promises';
import { IPlugin, PostEvalResult, RawProcessData } from '../plugins/IPlugin';
import { readFullPostContent } from './readPost';
import { replaceExt } from './fs';

export class PagesCreator {
  private _pagesQueue: {
    page: Page;
    props?: Record<string, unknown>;
  }[] = [];
  private _siteRender: ReturnType<SiteRendererFn> | undefined;
  private _evalService: EvalService;
  private _plugins: IPlugin[] = [];

  constructor(options: {
    siteRender?: ReturnType<SiteRendererFn>;
    cwd: string;
  }) {
    this._siteRender = options.siteRender;
    this._evalService = new EvalService(options);
  }

  set plugins(plugins: IPlugin[]) {
    this._plugins = [...plugins];
  }

  queuePage(page: Page, props?: Record<string, unknown>) {
    if (this._pagesQueue.some((item) => item.page.route === page.route)) {
      throw new BuildError(`Route already in use. Given "${page.route}"`);
    }

    this._pagesQueue.push({
      page,
      props,
    });
  }

  async renderPagesToTarget() {
    await tsup.build({
      // entry: {
      //  [path to output file]: "path to input file"
      // },
      entry: this._pagesQueue.reduce<Record<string, string>>((acc, item) => {
        const templateFileNameExt = (item.page.path.split(sep).at(-1) || item.page.path)
          .split('.')
          .at(-1);
        if (templateFileNameExt === 'tsx') {
          acc[join('./', replaceExt(item.page.relativePath, ''))] = item.page.path;
        }
        return acc;
      }, {}),
      format: ['esm'],
      outDir: TARGET_PAGES_DIR,
      external: ['react', 'react-dom'],
    });
  }

  async evalAndCreatePages() {
    const { model } = getAppContext();
    for (const { page, props } of this._pagesQueue) {
      const targetPageDir = dirname(join('./', TARGET_PAGES_DIR, page.relativePath));

      let rawProcessData: RawProcessData = {
        content: await readFullPostContent(page),
      };

      // Process RAW
      for (const plugin of this._plugins) {
        const modifiedData = await plugin.processRaw(
          page,
          rawProcessData,
          targetPageDir,
        );
        if (modifiedData.content) {
          rawProcessData.content = modifiedData.content;
        }
      }

      // Evaluating
      const evaluatedContent = await this._evalService.evalPage(page, {
        rawProcessData,
        targetPageDir,
        props,
      });

      const buildPageDir = dirname(join('./', BUILD_DIR, page.relativePath));
      await mkdir(buildPageDir, { recursive: true });

      const postEvalResult: PostEvalResult = {
        htmlAssets: [],
      };

      // Processing evaluated content
      // target -> build
      for (const plugin of this._plugins) {
        const result = await plugin.postEval(page, buildPageDir);
        if (result.htmlAssets) {
          postEvalResult.htmlAssets = [
            ...postEvalResult.htmlAssets,
            ...result.htmlAssets,
          ];
        }
      }

      const htmlContent = await renderHtmlOfPage({
        pageTitle: this._siteRender?.pageTitleRender
          ? this._siteRender.pageTitleRender(page)
          : `${model.config.titlePrefix} | ${page.config.title}`,
        metaDescription: model.config.metaDescription,
        content: evaluatedContent,
        assets: postEvalResult.htmlAssets,
      });

      await writeFile(join(buildPageDir, 'index.html'), htmlContent, {
        encoding: 'utf-8',
      });
    }
  }
}
