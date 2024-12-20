import process from 'node:process';
import { globby } from 'globby';
import { renderBlogPage } from 'html-generator';
import { $context } from '../context';

export const build = async () => {
  const cwd = process.cwd();
  $context.setKey('cwd', cwd);

  const mdFiles = await globby('posts/*/index.md', {
    cwd,
  });

  for (const fileName of mdFiles) {
    const content = await renderBlogPage({
      pageTitle: 'Blog',
      pageDescription: 'Blog Description',
      appContent: '<react>Content</react>',
    });

    console.log(content);
  }

  console.log('This is build command');
};
