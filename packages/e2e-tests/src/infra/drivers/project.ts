import { dirname, join } from 'node:path';
import { temporaryDirectory } from 'tempy';
import { writeJson, writePkgJson } from 'fs-utils';

export const projectDriver = () => {
  return {
    project: {
      setup,
    },
  };
};

const setup = async () => {
  const projectFolder = temporaryDirectory();
  const pkgJson = {
    dependencies: {
      'site-builder': `file:://${dirname(require.resolve('site-builder/package.json'))}`,
    },
  };

  await writePkgJson(projectFolder, pkgJson);

  await writeJson(join(projectFolder, 'tsconfig.json'), {
    extends: 'site-builder/tsconfig.user.json',
    include: ['src'],
  });
};
