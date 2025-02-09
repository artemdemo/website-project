import { dirname } from 'node:path';
import { temporaryDirectory } from 'tempy';

export const projectsDriver = () => {
  return {
    projects: {
      setup,
    },
  }
}

async function setup() {
  const projectFolder = temporaryDirectory();
  const pkgJson = {
    dependencies: {
      'site-builder': `file:://${dirname(require.resolve('site-builder/package.json'))}`,
    },
  };
}
