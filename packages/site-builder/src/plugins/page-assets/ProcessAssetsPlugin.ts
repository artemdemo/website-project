import { Page } from 'definitions';
import { copyFile } from 'node:fs/promises';
import { dirname, join, sep } from 'node:path';
import { IPlugin, PostEvalResult, RawProcessData } from '../IPlugin';
import { existsSync } from 'node:fs';

// Regex for an image format in `md` file.
// For example: `![Image title](some-image.png)`
const mdImgRegex = /!\[[^\[\]]+\]\(((?!https?:)[^()]+)\)/gm;
const imgRegex = /src="((?!https?:)\S+\.(png|jpg|jpeg))"/gm;
const videoRegex = /src="((?!https?:)\S+\.mp4)"/gm;

const findStrAssets = (rgx: RegExp, postContent: string) => {
  const results: Array<string> = [];
  let match = rgx.exec(postContent);
  while (match !== null) {
    if (match.index === rgx.lastIndex) {
      rgx.lastIndex++;
    }
    results.push(match[1]);
    match = rgx.exec(postContent);
  }
  return results;
};

const copyDeps = async (
  postPath: string,
  buildPageDir: string,
  fileNames: Array<string>,
) => {
  for (const imgName of fileNames) {
    const fileFrom = join(dirname(postPath), imgName);
    if (existsSync(fileFrom)) {
      await copyFile(fileFrom, join(buildPageDir, imgName));
    } else {
      console.warn(
        `[copyDeps] Trying to copy file that doesn't exist: "${fileFrom}"`,
      );
    }
  }
};

export class ProcessAssetsPlugin implements IPlugin {
  private _depsMap: WeakMap<
    Page,
    {
      images: string[];
      videos: string[];
    }
  > = new WeakMap();

  constructor() {}

  async processRaw(page: Page, { content }: RawProcessData) {
    this._depsMap.set(page, {
      images: [
        ...findStrAssets(mdImgRegex, content),
        ...findStrAssets(imgRegex, content),
      ],
      videos: findStrAssets(videoRegex, content),
    });
    return {};
  }

  async postEval(
    page: Page,
    buildPageDir: string,
  ): Promise<Partial<PostEvalResult>> {
    const deps = this._depsMap.get(page);
    if (deps) {
      await copyDeps(page.path, buildPageDir, deps.images);
      await copyDeps(page.path, buildPageDir, deps.videos);
    }
    if (page.thumbnailPath) {
      const thumbnailPathOrig = join(
        dirname(page.path),
        page.thumbnailPath,
      );
      const imgName = thumbnailPathOrig.split(sep).at(-1) || thumbnailPathOrig;
      await copyFile(thumbnailPathOrig, join(buildPageDir, imgName));
    }
    return {};
  }
}
