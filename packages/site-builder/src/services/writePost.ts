import { join, dirname, parse } from 'node:path';
import { writeFile, mkdir, copyFile } from 'node:fs/promises';
import { HtmlAsset, renderHtmlOfPage } from 'html-generator';
import { Page, PageAsset } from 'definitions';
import { BUILD_DIR } from '../constants';
import { BlogConfig } from './model/loadBlogConfig';
import { match } from 'variant';

export const writePage = async (
  post: Page,
  blogConfig: BlogConfig,
  postContent: string,
) => {
  const buildPostDir = dirname(join('./', BUILD_DIR, post.relativePath));
  const copyMap = new Map<string, string>();
  // const assets: Array<HtmlAsset> = [];
  // for (const asset of pageAssets) {
  //   assets.push(
  //     match(asset, {
  //       css: () => {
  //         const fileParts = parse(asset.path);
  //         const fileName = `${fileParts.name}${fileParts.ext}`;
  //         const buildAssetPath = join(buildPostDir, fileName);
  //         copyMap.set(asset.path, buildAssetPath);
  //         return HtmlAsset.css({
  //           linkHref: fileName,
  //         });
  //       },
  //     }),
  //   );
  // }
  const htmlContent = await renderHtmlOfPage({
    pageTitle: `${blogConfig.titlePrefix} | ${post.config.title}`,
    metaDescription: blogConfig.metaDescription,
    content: postContent,
    assets,
  });

  // await mkdir(buildPostDir, { recursive: true });

  // for (const asset of pageAssets) {
  //   match(asset, {
  //     css: () => {
  //       const copyTo = copyMap.get(asset.path);
  //       if (!copyTo) {
  //         throw new Error(`CopyTo path is not defined for "${asset.path}"`);
  //       }
  //       copyFile(join('./', asset.path), copyTo);
  //     },
  //   });
  // }

  await writeFile(join(buildPostDir, 'index.html'), htmlContent, {
    encoding: 'utf-8',
  });

  return {
    buildPostDir,
  };
};
