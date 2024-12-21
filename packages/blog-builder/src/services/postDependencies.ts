const imgRegex = /!\[[^\[\]]+\]\(([^()]+)\)/gm;
const videoRegex = /src="(\S+\.mp4)"/gm;

export const parsePostDependencies = (postContent: string) => {
  const results: {
    images: Array<string>;
    videos: Array<string>;
  } = {
    images: [],
    videos: [],
  };

  let imgMatch = imgRegex.exec(postContent);

  while (imgMatch !== null) {
    if (imgMatch.index === imgRegex.lastIndex) {
      imgRegex.lastIndex++;
    }
    results.images.push(imgMatch[1]);
    imgMatch = imgRegex.exec(postContent);
  }

  let videosMatch = videoRegex.exec(postContent);

  while (videosMatch !== null) {
    if (videosMatch.index === videoRegex.lastIndex) {
      videoRegex.lastIndex++;
    }
    results.videos.push(videosMatch[1]);
    videosMatch = videoRegex.exec(postContent);
  }

  return results;
};
