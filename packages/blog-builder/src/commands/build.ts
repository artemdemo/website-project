import { readFile } from 'node:fs/promises';
import * as mdx from '@mdx-js/mdx';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import * as runtime from 'react/jsx-runtime';
import { createAppContext, getAppContext } from '../services/context';
import { writePost } from '../services/writePost';

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

    await writePost(post, model.config, postContent);
  }
};
