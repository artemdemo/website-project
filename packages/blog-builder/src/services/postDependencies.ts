const imgRegex = /!\[[^\[\]]+\]\(([^()]+)\)/gm;

export const parsePostDependencies = (postContent: string) => {
  const results: {
    images: Array<string>;
  } = {
    images: [],
  };

  let imgMatch = imgRegex.exec(postContent);

  while (imgMatch !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (imgMatch.index === imgRegex.lastIndex) {
      imgRegex.lastIndex++;
    }

    results.images.push(imgMatch[1]);

    imgMatch = imgRegex.exec(postContent);
  }

  return results;
};
