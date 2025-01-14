import { join, dirname } from 'node:path';
import { writeFile, mkdir } from 'node:fs/promises';
import { renderHtmlOfBlogPage } from 'html-generator';
import type { Post } from 'definitions';
import { BUILD_DIR } from '../constants';
import { BlogConfig } from './model/loadBlogConfig';

export const writePost = async (
  post: Post,
  blogConfig: BlogConfig,
  postContent: string,
) => {
  const htmlContent = await renderHtmlOfBlogPage({
    pageTitle: `${blogConfig.titlePrefix} | ${post.config.title}`,
    metaDescription: blogConfig.metaDescription,
    content: postContent,
  });

  const buildPostDir = dirname(join('./', BUILD_DIR, post.relativePath));

  await mkdir(buildPostDir, { recursive: true });
  await writeFile(join(buildPostDir, 'index.html'), htmlContent, {
    encoding: 'utf-8',
  });

  return {
    buildPostDir,
  };
};
