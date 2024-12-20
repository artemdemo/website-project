import process from 'node:process';
import { writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path';
import { globby } from 'globby';
import { renderBlogPage } from 'html-generator';
import { $context } from '../context';
import { BUILD_DIR } from '../constants';

export const build = async () => {
  const cwd = process.cwd();
  $context.setKey('cwd', cwd);

  const mdFiles = await globby('posts/*/index.md', {
    cwd,
  });

  for (const fileName of mdFiles) {
    const content = await renderBlogPage({
      pageTitle: 'Blog',
      metaDescription: 'Blog Description',
      content: '<react>Content</react>',
    });

    const postDir = dirname(join('./', BUILD_DIR, fileName));
    await mkdir(postDir, { recursive: true });
    await writeFile(join(postDir, 'index.html'), content, { encoding: 'utf-8' });
  }
};
