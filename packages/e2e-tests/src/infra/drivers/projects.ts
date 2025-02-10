import { dirname, join } from 'node:path';
import { temporaryDirectory } from 'tempy';

export const projectDriver = () => {
  return {
    project: {
      setup,
    },
  };
};

async function setup() {
  const projectFolder = temporaryDirectory();
  const pkgJson = {
    dependencies: {
      'site-builder': `file:://${dirname(require.resolve('site-builder/package.json'))}`,
    },
  };
  const pkgJsonPath = join(projectFolder, 'package.json');
}
