import React from 'react';
import { match, isType } from 'variant';
import * as mdx from '@mdx-js/mdx';
import { renderToStaticMarkup } from 'react-dom/server';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import tsup from 'tsup';
import * as runtime from 'react/jsx-runtime';
import { SiteRendererFn } from 'definitions';
import { createAppContext, getAppContext } from '../services/context';
import { writePost } from '../services/writePost';
import { readFullPostContent } from '../services/readPost';
import { processPostAssets } from '../services/postAssets';
import { BUILD_DIR } from '../constants';

export const build = async () => {
  await createAppContext();
  const { model, cwd } = getAppContext();

  await rm(BUILD_DIR, { recursive: true, force: true });

  await tsup.build({
    entry: ['src/site.render.ts'],
    format: ['esm'],
    outDir: 'target',
  });

  await tsup.build({
    entry: model?.pages
      .filter((page) => isType(page, 'tsx'))
      .map((page) => page.path),
    format: ['esm'],
    outDir: join('target', 'pages'),
  });

  const sireRenderFn: SiteRendererFn = (
    await import(`${cwd}/target/site.render.js`)
  ).default;

  const siteRender = sireRenderFn();

  for (const page of model?.pages) {
    await match(page, {
      md: async () => {
        const fullPostContent = await readFullPostContent(page);
        const evaluated = await mdx.evaluate(fullPostContent, runtime);

        const postContent = renderToStaticMarkup(
          siteRender.pageRender({
            content: React.createElement(evaluated.default),
          }),
        );
        const { buildPostDir } = await writePost(
          page,
          model.config,
          postContent,
        );
        await processPostAssets(page, buildPostDir, fullPostContent);
      },
      tsx: async () => {
        const transpiledPagePath = join(
          'target',
          'pages',
          page.relativePath.replace('.tsx', '.js'),
        );
        const Page = await import(`${cwd}/${transpiledPagePath}`);
        const postContent = renderToStaticMarkup(
          siteRender.pageRender({
            content: React.createElement(Page.default),
          }),
        );
        await writePost(page, model.config, postContent);
      },
    });
  }
};
