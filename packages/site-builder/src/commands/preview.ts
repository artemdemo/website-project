import { createServer } from 'preview';

export const preview = async () => {
  createServer({
    contentFolder: 'build',
    addTrailingSlash: false,
  });
};
