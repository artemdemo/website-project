import React from 'react';
import * as mdx from '@mdx-js/mdx';
import { renderToStaticMarkup } from 'react-dom/server';
import { rm } from 'node:fs/promises';
import * as runtime from 'react/jsx-runtime';
import { evaluateBlogPost } from 'ui-components';
import { createAppContext, getAppContext } from '../services/context';
import { writePost } from '../services/writePost';
import { readFullPostContent } from '../services/readPost';
import { processPostAssets } from '../services/postAssets';
import { BUILD_DIR } from '../constants';

export const build = async () => {
  await createAppContext();
  const { model } = getAppContext();

  await rm(BUILD_DIR, { recursive: true, force: true });

  for (const post of model?.posts) {
    const fullPostContent = await readFullPostContent(post);

    const evaluated = await mdx.evaluate(fullPostContent, runtime);

    evaluateBlogPost();

    const postContent = renderToStaticMarkup(
      React.createElement(evaluated.default),
    );

    const { buildPostDir } = await writePost(post, model.config, postContent);

    await processPostAssets(post, buildPostDir, fullPostContent);
  }
};
