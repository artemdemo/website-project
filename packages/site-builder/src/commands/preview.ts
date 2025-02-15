import { BUILD_DIR } from '@artemdemo/definitions';
import { createServer } from '@artemdemo/preview';

export const preview = async () => {
  createServer({
    contentFolder: BUILD_DIR,
    addTrailingSlash: false,
  });
};
