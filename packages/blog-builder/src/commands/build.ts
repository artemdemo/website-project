import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { wrapBlogPage } from 'html-generator';
import * as mdx from '@mdx-js/mdx';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import * as runtime from 'react/jsx-runtime';
import { BUILD_DIR } from '../constants';
import { createAppContext, getAppContext } from '../services/context';

export const build = async () => {
  await createAppContext();
  const { model } = getAppContext();

  for (const post of model?.posts) {
    const evaluated = await mdx.evaluate(
      await readFile(post.path, 'utf8'),
      runtime,
    );
    const postContent = renderToStaticMarkup(
      React.createElement(evaluated.default),
    );

    const content = await wrapBlogPage({
      pageTitle: `${model.config.titlePrefix} | ${post.config.title}`,
      metaDescription: model.config.metaDescription,
      content: postContent,
    });

    const postDir = dirname(join('./', BUILD_DIR, post.relativePath));

    await mkdir(postDir, { recursive: true });
    await writeFile(join(postDir, 'index.html'), content, {
      encoding: 'utf-8',
    });
  }
};
