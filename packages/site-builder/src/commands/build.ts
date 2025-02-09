import _isFunction from 'lodash/isFunction';
import { mkdir, rm } from 'node:fs/promises';
import { join, sep } from 'node:path';
import tsup from 'tsup';
import { Page, SiteRendererFn } from 'definitions';
import { createAppContext, getAppContext } from '../services/context';
import {
  BUILD_ASSETS_DIR,
  BUILD_DIR,
  TARGET_DIR,
} from '../constants';
import { MdImportsPlugin } from '../plugins/md/MdImportsPlugin';
import { IPlugin } from '../plugins/IPlugin';
import { ProcessAssetsPlugin } from '../plugins/page-assets/ProcessAssetsPlugin';
import { PageCssPlugin } from '../plugins/page-css/PageCssPlugin';
import { queryPagesGQL } from '../query/queryPagesGQL';
import { PagesCreator } from '../services/PagesCreator';

export const build = async () => {
  await createAppContext();
  const { model, cwd } = getAppContext();

  await rm(BUILD_DIR, { recursive: true, force: true });

  await tsup.build({
    entry: ['src/site.render.ts'],
    format: ['esm'],
    outDir: TARGET_DIR,
    external: ['react', 'react-dom'],
  });

  await mkdir(join('./', BUILD_ASSETS_DIR), { recursive: true });

  const sireRenderFn: SiteRendererFn = (
    await import(`${cwd}/target/site.render.js`)
  ).default;
  const siteRender = sireRenderFn();

  const plugins: IPlugin[] = [
    new MdImportsPlugin(),
    new ProcessAssetsPlugin(),
    new PageCssPlugin(),
  ];

  const pagesCreator = new PagesCreator({ cwd, siteRender });

  pagesCreator.plugins = plugins;

  for (const page of model?.pages) {
    pagesCreator.queuePage(page);
  }

  await pagesCreator.renderPagesToTarget();

  await pagesCreator.evalAndCreatePages();

  //
  // Rendering custom user pages.
  if (siteRender.renderPages) {
    const pagesCreator = new PagesCreator({ cwd, siteRender });

    pagesCreator.plugins = plugins;

    await siteRender.renderPages({
      createPage: ({ templatePath, title, route, props }) => {
        const relativePath = join(route.split('/').join(sep), 'index.js');
        const page = Page.tsx({
          route,
          path: templatePath,
          relativePath,
          config: {
            title,
          },
        });
        pagesCreator.queuePage(page, props);
      },
      queryPages: async (query) => {
        return queryPagesGQL(query);
      },
    });

    await pagesCreator.renderPagesToTarget();

    // ToDo: Now I need to render actual html here.
    // Use `EvalService.evalTS()`

    await pagesCreator.evalAndCreatePages();
  }
};
