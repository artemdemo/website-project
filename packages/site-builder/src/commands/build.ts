import React from 'react';
import { match, isType } from 'variant';
import * as mdx from '@mdx-js/mdx';
import { renderToStaticMarkup } from 'react-dom/server';
import { rm } from 'node:fs/promises';
import { join, format, parse } from 'node:path';
import tsup from 'tsup';
import * as runtime from 'react/jsx-runtime';
import { PageAsset, PageProps, SiteRendererFn } from 'definitions';
import { createAppContext, getAppContext } from '../services/context';
import { writePage } from '../services/writePost';
import { readFullPostContent } from '../services/readPost';
import { processPostAssets } from '../services/postAssets';
import { BUILD_DIR } from '../constants';
import { queryPages } from '../services/queryPages';
import { buildMdxImports } from '../services/md/buildMdxImports';
import { processMdImports } from '../services/md/processMdImports';

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

  const mdImports = await buildMdxImports(model);

  console.log(mdImports);

  const pageProps: PageProps = {
    queryPages,
  };

  // MD files:
  // * process raw md
  //     - get all the tsx imports
  // * target build
  //     - here you need transpile files into target folder
  // * post evaluation
  //    - rendering markup (React)
  for (const page of model?.pages) {
    await match(page, {
      md: async () => {
        const { fullPostContent, pageAssets } = processMdImports(
          page,
          mdImports,
          await readFullPostContent(page),
        );

        const evaluated = await mdx.evaluate(fullPostContent, {
          ...runtime,
          baseUrl: `file://${cwd}/index`,
        });

        const postContent = renderToStaticMarkup(
          siteRender.pageRender({
            content: React.createElement(evaluated.default, pageProps),
          }),
        );
        const { buildPostDir } = await writePage(
          page,
          model.config,
          postContent,
          pageAssets,
        );
        await processPostAssets(page, buildPostDir, fullPostContent);
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
        const postContent = renderToStaticMarkup(
          siteRender.pageRender({
            content: React.createElement(Page.default, pageProps),
          }),
        );
        await writePage(page, model.config, postContent, []);
      },
    });
  }
};
