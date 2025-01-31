import React from 'react';
import { match, isType } from 'variant';
import * as mdx from '@mdx-js/mdx';
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, dirname, format, parse } from 'node:path';
import tsup from 'tsup';
import * as runtime from 'react/jsx-runtime';
import { PageProps, SiteRendererFn } from 'definitions';
import { createAppContext, getAppContext } from '../services/context';
import { readFullPostContent } from '../services/readPost';
import { processPostAssets } from '../services/postAssets';
import { BUILD_DIR } from '../constants';
import { queryPages } from '../services/queryPages';
// import { buildMdxImports } from '../services/md/buildMdxImports';
import { MdImportsPlugin } from '../plugins/md/MdImportsPlugin';
import { IPlugin } from '../plugins/IPlugin';
import { HtmlAsset, renderHtmlOfPage } from 'html-generator';

export const build = async () => {
  await createAppContext();
  const { model, cwd } = getAppContext();

  await rm(BUILD_DIR, { recursive: true, force: true });

  await tsup.build({
    entry: ['src/site.render.ts'],
    format: ['esm'],
    outDir: 'target',
    external: ['react', 'react-dom'],
  });

  await tsup.build({
    entry: model?.pages
      .filter((page) => isType(page, 'tsx'))
      .map((page) => page.path),
    format: ['esm'],
    outDir: join('target', 'pages'),
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

  const plugins: IPlugin[] = [new MdImportsPlugin()];

  for (const page of model?.pages) {
    let content: string = await readFullPostContent(page);

    // Process RAW
    for (const plugin of plugins) {
      const contentResult = await plugin.processRaw(page, content);
      if (contentResult) {
        content = contentResult;
      }
    }

    const buildPostDir = dirname(join('./', BUILD_DIR, page.relativePath));
    await mkdir(buildPostDir, { recursive: true });

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
          'target',
          'pages',
          format({
            ...parse(page.relativePath),
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

    const htmlAssets: Array<HtmlAsset> = [];

    // Processing evaluated content
    for (const plugin of plugins) {
      htmlAssets.push(...(await plugin.postEval(page, buildPostDir)));
    }

    if (evaluatedContent) {
      // ToDo: Dedicated plugin for rendering HTML?
      const htmlContent = await renderHtmlOfPage({
        pageTitle: `${model.config.titlePrefix} | ${page.config.title}`,
        metaDescription: model.config.metaDescription,
        content: evaluatedContent,
        assets: htmlAssets,
      });

      await writeFile(join(buildPostDir, 'index.html'), htmlContent, {
        encoding: 'utf-8',
      });

      // ToDo: Isn't it only for MD files??
      //   Move it inside dedicated plugin?
      await processPostAssets(page, buildPostDir, content);
    }
  }
};
