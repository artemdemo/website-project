import { BUILD_DIR } from 'definitions';
import { createServer } from 'preview';

export const preview = async () => {
  createServer({
    contentFolder: BUILD_DIR,
    addTrailingSlash: false,
  });
};
