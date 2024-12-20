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

  console.log(mdFiles);

  console.log('This is build command');
};
