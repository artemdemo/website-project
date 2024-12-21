import * as mdx from '@mdx-js/mdx';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { rm, copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import * as runtime from 'react/jsx-runtime';
import { createAppContext, getAppContext } from '../services/context';
import { writePost } from '../services/writePost';
import { readFullPostContent } from '../services/readPost';
import { parsePostDependencies } from '../services/postDependencies';
import { BUILD_DIR } from '../constants';

export const build = async () => {
  await createAppContext();
  const { model } = getAppContext();

  await rm(BUILD_DIR, { recursive: true, force: true });

  for (const post of model?.posts) {
    const fullPostContent = await readFullPostContent(post);

    const evaluated = await mdx.evaluate(fullPostContent, runtime);

    const postContent = renderToStaticMarkup(
      React.createElement(evaluated.default),
    );

    const { buildPostDir } = await writePost(post, model.config, postContent);

    const deps = parsePostDependencies(fullPostContent);

    for (const imgName of deps.images) {
      await copyFile(
        join(dirname(post.path), imgName),
        join(buildPostDir, imgName),
      );
    }
  }
};
