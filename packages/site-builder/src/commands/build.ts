import _isFunction from 'lodash/isFunction';
import { mkdir, rm } from 'node:fs/promises';
import { join, sep } from 'node:path';
import { BUILD_ASSETS_DIR, BUILD_DIR, Page, TARGET_DIR } from 'definitions';
import { createAppContext, getAppContext } from '../services/context';
import { MdImportsPlugin } from '../plugins/md/MdImportsPlugin';
import { IPlugin } from '../plugins/IPlugin';
import { ProcessAssetsPlugin } from '../plugins/page-assets/ProcessAssetsPlugin';
import { PageCssPlugin } from '../plugins/page-css/PageCssPlugin';
import { queryPagesGQL } from '../query/queryPagesGQL';
import { PagesCreator } from '../services/PagesCreator';
import { loadSiteRender } from '../services/loadSiteRender';

export const build = async () => {
  await createAppContext();
  const { model, cwd } = getAppContext();

  await rm(BUILD_DIR, { recursive: true, force: true });
  await rm(TARGET_DIR, { recursive: true, force: true });

  const siteRender = await loadSiteRender(cwd);

  await mkdir(join('./', BUILD_ASSETS_DIR), { recursive: true });

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

    await pagesCreator.evalAndCreatePages();
  }
};
