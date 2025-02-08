import tsup from 'tsup';
import { join, sep } from 'node:path';
import { Page, SiteRendererFn } from 'definitions';
import { BuildError } from 'error-reporter';
import { EvalService } from './EvalService';
import { BUILD_DIR, TARGET_PAGES_DIR } from '../constants';
import { renderHtmlOfPage } from 'html-generator';
import { getAppContext } from './context';
import { mkdir, writeFile } from 'node:fs/promises';

export class CustomPagesCreator {
  private _pagesQueue: {
    page: Page;
    props?: Record<string, unknown>;
  }[] = [];
  private _cwd: string;
  private _siteRender: ReturnType<SiteRendererFn> | undefined;
  private _evalService: EvalService;

  constructor(options: {
    siteRender?: ReturnType<SiteRendererFn>;
    cwd: string;
  }) {
    this._siteRender = options.siteRender;
    this._cwd = options.cwd;
    this._evalService = new EvalService(options);
  }

  queuePage(page: Page, props?: Record<string, unknown>) {
    const templateFileNameExt = (page.path.split(sep).at(-1) || page.path)
      .split('.')
      .at(-1);
    if (templateFileNameExt !== 'tsx') {
      throw new BuildError(
        `Template file could have only 'tsx' extension. Given "${templateFileNameExt}", see in "${page.path}"`,
      );
    }

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
        acc[join('./', item.page.relativePath, 'index')] = item.page.path;
        return acc;
      }, {}),
      format: ['esm'],
      outDir: TARGET_PAGES_DIR,
      external: ['react', 'react-dom'],
    });
  }

  async evalAndCreatePages() {
    const { model } = getAppContext();
    for (const qItem of this._pagesQueue) {
      const userPage = await import(
        join(this._cwd, TARGET_PAGES_DIR, qItem.page.relativePath, `index.js`)
      );
      if (!userPage.default) {
        throw new BuildError(
          `Can't evaluate page that doesn't have "default" export. See "${qItem.page.path}"`,
        );
      }
      const evaluatedContent = await this._evalService.evalTS(
        userPage,
        qItem.props,
      );

      const buildPageDir = join('./', BUILD_DIR, qItem.page.relativePath);
      await mkdir(buildPageDir, { recursive: true });

      const htmlContent = await renderHtmlOfPage({
        pageTitle: this._siteRender?.pageTitleRender
          ? this._siteRender.pageTitleRender(qItem.page)
          : `${model.config.titlePrefix} | ${qItem.page.config.title}`,
        metaDescription: model.config.metaDescription,
        content: evaluatedContent,
        // ToDo: I need to run here postEval plugins.
        //  (Page could have assets, like css, images, etc)
        //  But I don't have a good idea (at the moment) how to do it.
        assets: [],
      });

      await writeFile(join(buildPageDir, 'index.html'), htmlContent, {
        encoding: 'utf-8',
      });
    }
  }
}
