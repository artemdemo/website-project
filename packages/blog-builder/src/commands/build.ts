import process from 'node:process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname, sep } from 'node:path';
import { globby } from 'globby';
import { wrapBlogPage } from 'html-generator';
import { compile } from '@mdx-js/mdx';
import { $context } from '../context';
import { BUILD_DIR, POSTS_DIR } from '../constants';

export const build = async () => {
  const cwd = process.cwd();
  $context.setKey('cwd', cwd);

  const mdFiles = await globby(`${POSTS_DIR}/*/index.md`, {
    cwd,
  });

  for (const fileName of mdFiles) {
    const compiled = await compile(await readFile(fileName));
    console.log(compiled);

    const content = await wrapBlogPage({
      pageTitle: 'Blog',
      metaDescription: 'Blog Description',
      content: '<react>Content</react>',
    });

    // I want blog posts to be flat in the `build/` folder
    // Thisway I'll need only to copy them as is in `blog/` folder,
    // when I'll be ready to publish
    const fileNameNorm = fileName.replace(
      new RegExp(`^${POSTS_DIR}${sep}`),
      '',
    );
    const postDir = dirname(join('./', BUILD_DIR, fileNameNorm));

    await mkdir(postDir, { recursive: true });
    await writeFile(join(postDir, 'index.html'), content, {
      encoding: 'utf-8',
    });
  }
};
