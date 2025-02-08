import tsup from 'tsup';
import { dirname, join, sep } from 'node:path';
import { CreatePageOptions, Page, SiteRendererFn } from 'definitions';
import { BuildError } from 'error-reporter';
import { EvalService } from './EvalService';
import { BUILD_DIR, TARGET_PAGES_DIR } from '../constants';
import { renderHtmlOfPage } from 'html-generator';
import { getAppContext } from './context';
import { mkdir, writeFile } from 'node:fs/promises';

export class CustomPagesCreator {
  private _queue: {
    templatePath: string;
    targetPath: string;
    relativePath: string;
    route: string;
    title: string;
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

  queuePage({ templatePath, title, route, props }: CreatePageOptions) {
    const templateFileNameExt = (templatePath.split(sep).at(-1) || templatePath)
      .split('.')
      .at(-1);
    if (templateFileNameExt !== 'tsx') {
      throw new BuildError(
        `Template file could have only 'tsx' extension. Given "${templateFileNameExt}", see in "${templatePath}"`,
      );
    }

    if (this._queue.some((item) => item.route === route)) {
      throw new BuildError(`Route already in use. Given "${route}"`);
    }

    const relativePath = route.split('/').join(sep);

    const targetPath = join(
      TARGET_PAGES_DIR,
      relativePath,
      'index',
    );

    this._queue.push({
      templatePath,
      targetPath,
      relativePath,
      route,
      title,
      props,
    });
  }

  async renderPagesToTarget() {
    await tsup.build({
      entry: this._queue.reduce<Record<string, string>>((acc, item) => {
        acc[item.targetPath] = item.templatePath;
        return acc;
      }, {}),
      format: ['esm'],
      outDir: '.',
      external: ['react', 'react-dom'],
    });
  }

  async evalAndCreatePages() {
    const { model } = getAppContext();
    for (const qItem of this._queue) {
      const userPage = await import(`${this._cwd}/${qItem.targetPath}.js`);
      if (!userPage.default) {
        throw new BuildError(
          `Can't evaluate page that doesn't have "default" export. See "${qItem.templatePath}"`,
        );
      }
      const evaluatedContent = await this._evalService.evalTS(userPage, qItem.props);

      const buildPageDir = join('./', BUILD_DIR, qItem.relativePath);
      await mkdir(buildPageDir, { recursive: true });

      const page: Page = Page.tsx({
        route: qItem.route,
        path: qItem.templatePath,
        relativePath: qItem.relativePath,
        config: {
          title: qItem.title,
        },
      });

      const htmlContent = await renderHtmlOfPage({
        pageTitle: this._siteRender?.pageTitleRender
          ? this._siteRender.pageTitleRender(page)
          : `${model.config.titlePrefix} | ${page.config.title}`,
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
