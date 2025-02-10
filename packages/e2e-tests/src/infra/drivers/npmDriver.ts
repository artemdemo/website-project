import { readPkgJson } from 'fs-utils';
import { mkdir, symlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { BuildError } from 'error-reporter';

export const npmDriver = () => {
  return {
    npm: {
      install,
    },
  };
};

const install = async (projectFolder: string) => {
  const pkgJson = await readPkgJson(projectFolder);
  const deps = {
    ...pkgJson.dependencies,
    ...pkgJson.devDependencies,
  };
  const nodeModulesPath = join(projectFolder, 'node_modules');
  await mkdir(nodeModulesPath);
  await Promise.all(
    Object.entries(deps).map(async ([pkgName, pkgPath]) => {
      if (!pkgPath.startsWith('file://')) {
        throw new BuildError(
          `Package path should be actual path to folder. See "${pkgName}". Path "${pkgPath}"`,
        );
      }
      const orgPkgPath = pkgPath.replace('file://', '');
      const targetPkgPath = join(nodeModulesPath, pkgName);
      await mkdir(dirname(targetPkgPath), { recursive: true });
      await symlink(orgPkgPath, targetPkgPath);
    }),
  );
};
