import tsup from 'tsup';
import { dirname, join, sep } from 'node:path';
import { BUILD_DIR, Page, TARGET_PAGES_DIR } from '@artemdemo/definitions';
import { BuildError } from '@artemdemo/error-reporter';
import { EvalService } from './EvalService';
import { renderHtmlOfPage } from '@artemdemo/html-generator';
import { replaceExt } from '@artemdemo/fs-utils';
import { mkdir, writeFile } from 'node:fs/promises';
import { getAppContext } from './context';
import { IPlugin, PostEvalResult, RawProcessData } from '../plugins/IPlugin';
import { readFullPostContent } from './readPost';
import { SiteRenderFactory } from './SiteRenderFactory';

export class PagesCreator {
  private _pagesQueue: {
    page: Page;
    props?: Record<string, unknown>;
  }[] = [];
  private _siteRenderFactory: SiteRenderFactory;
  private _evalService: EvalService;
  private _plugins: IPlugin[] = [];

  constructor(options: { siteRenderFactory: SiteRenderFactory; cwd: string }) {
    this._siteRenderFactory = options.siteRenderFactory;
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
    const entry = this._pagesQueue.reduce<Record<string, string>>(
      (acc, item) => {
        const templateFileNameExt = (
          item.page.path.split(sep).at(-1) || item.page.path
        )
          .split('.')
          .at(-1);
        if (templateFileNameExt === 'tsx') {
          acc[join('./', replaceExt(item.page.relativePath, ''))] =
            item.page.path;
        }
        return acc;
      },
      {},
    );
    if (Object.keys(entry).length > 0) {
      await tsup.build({
        // entry: {
        //  [path to output file]: "path to input file"
        // },
        entry,
        format: ['esm'],
        outDir: TARGET_PAGES_DIR,
        external: ['react', 'react-dom'],
      });
    }
  }

  async evalAndCreatePages() {
    const { model } = getAppContext();
    for (const { page, props } of this._pagesQueue) {
      const targetPageDir = dirname(
        join('./', TARGET_PAGES_DIR, page.relativePath),
      );

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

      postEvalResult.htmlAssets.push(
        ...this._siteRenderFactory.getHtmlAssets(),
      );

      const siteRenderData = await this._siteRenderFactory.load();

      const htmlContent = await renderHtmlOfPage({
        pageTitle: siteRenderData?.pageTitleRender
          ? siteRenderData.pageTitleRender(page)
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
