import { isType } from 'variant';
import _isFunction from 'lodash/isFunction';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import tsup from 'tsup';
import { SiteRendererFn } from 'definitions';
import { renderHtmlOfPage } from 'html-generator';
import { createAppContext, getAppContext } from '../services/context';
import { readFullPostContent } from '../services/readPost';
import { BUILD_ASSETS_DIR, BUILD_DIR, TARGET_DIR } from '../constants';
import { MdImportsPlugin } from '../plugins/md/MdImportsPlugin';
import { IPlugin, PostEvalResult, RawProcessData } from '../plugins/IPlugin';
import { ProcessAssetsPlugin } from '../plugins/page-assets/ProcessAssetsPlugin';
import { PageCssPlugin } from '../plugins/page-css/PageCssPlugin';
import { EvalService } from '../services/EvalService';

const TARGET_PAGES_DIR = join(TARGET_DIR, 'pages');

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

  await tsup.build({
    // Images can be inlined using Custom Loader
    // https://tsup.egoist.dev/#custom-loader
    // loader: {
    //   '.png': 'base64',
    //   '.webp': 'file',
    // },
    entry: model?.pages
      .filter((page) => isType(page, 'tsx'))
      .map((page) => page.path),
    format: ['esm'],
    outDir: TARGET_PAGES_DIR,
    external: ['react', 'react-dom'],
  });

  await mkdir(join('./', BUILD_ASSETS_DIR), { recursive: true });

  const sireRenderFn: SiteRendererFn = (
    await import(`${cwd}/target/site.render.js`)
  ).default;

  const plugins: IPlugin[] = [
    new MdImportsPlugin(),
    new ProcessAssetsPlugin(),
    new PageCssPlugin(),
  ];

  const evalService = new EvalService({ siteRender: sireRenderFn(), cwd });

  for (const page of model?.pages) {
    const targetPageDir = dirname(
      join('./', TARGET_PAGES_DIR, page.relativePath),
    );

    let rawProcessData: RawProcessData = {
      content: await readFullPostContent(page),
    };

    // Process RAW
    for (const plugin of plugins) {
      const modifiedData = await plugin.processRaw(
        page,
        rawProcessData,
        targetPageDir,
      );
      if (modifiedData.content) {
        rawProcessData.content = modifiedData.content;
      }
    }

    const buildPageDir = dirname(join('./', BUILD_DIR, page.relativePath));
    await mkdir(buildPageDir, { recursive: true });

    // Evaluating
    const evaluatedContent = await evalService.evaluate({
      page,
      rawProcessData,
      targetPageDir,
    });

    const postEvalResult: PostEvalResult = {
      htmlAssets: [],
    };

    // Processing evaluated content
    // target -> build
    for (const plugin of plugins) {
      const result = await plugin.postEval(page, buildPageDir);
      if (result.htmlAssets) {
        postEvalResult.htmlAssets = [
          ...postEvalResult.htmlAssets,
          ...result.htmlAssets,
        ];
      }
    }

    const htmlContent = await renderHtmlOfPage({
      pageTitle: `${model.config.titlePrefix} | ${page.config.title}`,
      metaDescription: model.config.metaDescription,
      content: evaluatedContent,
      assets: postEvalResult.htmlAssets,
    });

    await writeFile(join(buildPageDir, 'index.html'), htmlContent, {
      encoding: 'utf-8',
    });
  }
};
