import { Post } from 'definitions';
import { copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

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
  buildPostDir: string,
  fileNames: Array<string>,
) => {
  for (const imgName of fileNames) {
    await copyFile(
      join(dirname(postPath), imgName),
      join(buildPostDir, imgName),
    );
  }
};

export const processPostAssets = async (
  post: Post,
  buildPostDir: string,
  fullPostContent: string,
) => {
  const deps = {
    images: findStrAssets(imgRegex, fullPostContent),
    videos: findStrAssets(videoRegex, fullPostContent),
  };

  await copyDeps(post.path, buildPostDir, deps.images);
  await copyDeps(post.path, buildPostDir, deps.videos);
};
