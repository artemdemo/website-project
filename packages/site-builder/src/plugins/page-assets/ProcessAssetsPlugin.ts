import { Page } from 'definitions';
import { copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { IPlugin, PostEvalResult } from '../IPlugin';

// Regex for an image format in `md` file.
// For example: `![Image title](some-image.png)`
const imgRegex = /!\[[^\[\]]+\]\(([^()]+)\)/gm;
const videoRegex = /src="(\S+\.mp4)"/gm;

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
    await copyFile(
      join(dirname(postPath), imgName),
      join(buildPageDir, imgName),
    );
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

  async processRaw(page: Page, content: string): Promise<string | undefined> {
    this._depsMap.set(page, {
      images: findStrAssets(imgRegex, content),
      videos: findStrAssets(videoRegex, content),
    });
    return undefined;
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
    return {};
  }
}
