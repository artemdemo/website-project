import React from 'react';
import { match, isType } from 'variant';
import * as mdx from '@mdx-js/mdx';
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, dirname, format, parse, basename } from 'node:path';
import tsup from 'tsup';
import * as runtime from 'react/jsx-runtime';
import { PageProps, SiteRendererFn } from 'definitions';
import { renderHtmlOfPage } from 'html-generator';
import { createAppContext, getAppContext } from '../services/context';
import { readFullPostContent } from '../services/readPost';
import { BUILD_DIR, TARGET_DIR } from '../constants';
import { queryPages } from '../services/queryPages';
import { MdImportsPlugin } from '../plugins/md/MdImportsPlugin';
import { IPlugin, PostEvalResult } from '../plugins/IPlugin';
import { ProcessAssetsPlugin } from '../plugins/page-assets/ProcessAssetsPlugin';
import { PageCssPlugin } from '../plugins/page-css/PageCssPlugin';

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
    entry: model?.pages
      .filter((page) => isType(page, 'tsx'))
      .map((page) => page.path),
    format: ['esm'],
    outDir: TARGET_PAGES_DIR,
    external: ['react', 'react-dom'],
  });

  const sireRenderFn: SiteRendererFn = (
    await import(`${cwd}/target/site.render.js`)
  ).default;

  const siteRender = sireRenderFn();

  const pageProps: PageProps = {
    queryPages,
  };

  // MD files:
  // * process raw md
  //     - get all the tsx imports
  // * target build (core logic, not in the plugin)
  //     - here you need transpile files into target folder
  // * post evaluation
  //    - rendering markup (React)

  const plugins: IPlugin[] = [
    new MdImportsPlugin(),
    new ProcessAssetsPlugin(),
    new PageCssPlugin(),
  ];

  for (const page of model?.pages) {
    let content: string = await readFullPostContent(page);

    // Process RAW
    for (const plugin of plugins) {
      const contentResult = await plugin.processRaw(page, content);
      if (contentResult) {
        content = contentResult;
      }
    }

    const buildPageDir = dirname(join('./', BUILD_DIR, page.relativePath));
    await mkdir(buildPageDir, { recursive: true });

    const targetPageDir = dirname(join('./', TARGET_PAGES_DIR, page.relativePath));

    // Evaluating
    const evaluatedContent = await match(page, {
      md: async () => {
        const evaluated = await mdx.evaluate(content, {
          ...runtime,
          baseUrl: `file://${cwd}/index`,
        });

        return renderToStaticMarkup(
          siteRender.pageRender({
            content: React.createElement(evaluated.default, pageProps),
          }),
        );
      },
      tsx: async () => {
        const transpiledPagePath = join(
          targetPageDir,
          format({
            ...parse(basename(page.relativePath)),
            base: '',
            ext: '.js',
          }),
        );
        const Page = await import(`${cwd}/${transpiledPagePath}`);
        return renderToStaticMarkup(
          siteRender.pageRender({
            content: React.createElement(Page.default, pageProps),
          }),
        );
      },
    });

    const postEvalResult: PostEvalResult = {
      htmlAssets: [],
    };

    // Processing evaluated content
    for (const plugin of plugins) {
      const result = await plugin.postEval(page, buildPageDir);
      if (result.htmlAssets) {
        postEvalResult.htmlAssets = [
          ...postEvalResult.htmlAssets,
          ...result.htmlAssets,
        ];
      }
    }

    // ToDo: Dedicated plugin for rendering HTML?
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
