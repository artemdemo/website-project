import { createServer } from 'preview';
import { BUILD_DIR } from '../constants';

export const preview = async () => {
  createServer({
    contentFolder: BUILD_DIR,
    addTrailingSlash: false,
  });
};
