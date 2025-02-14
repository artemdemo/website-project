// import { readPkgJson } from 'fs-utils';
// import { mkdir, symlink } from 'node:fs/promises';
// import { dirname, join } from 'node:path';
// import { BuildError } from 'error-reporter';
import { execa } from 'execa';

export const npmDriver = () => {
  return {
    npm: {
      install,
      build,
      preview,
    },
  };
};

const install = async (projectFolder: string) => {
  await execa('npm', ['install'], { cwd: projectFolder });
};

const build = async (projectFolder: string) => {
  await execa('npm', ['run', 'build'], { cwd: projectFolder });
};

const previewUrlRegex = /(https?:\/\/\S+:\d+)/;

const preview = (projectFolder: string) => {
  const previewProcess = execa('npm', ['run', 'preview'], {
    cwd: projectFolder,
  });
  const stdout: string[] = [];
  const stderr: string[] = [];
  let urlPromiseResolve: (value: string) => void;
  const urlPromise = new Promise<string>((resolve) => {
    urlPromiseResolve = resolve;
  });
  previewProcess.stdout.on('data', (chunk) => {
    const strChunk = chunk.toString();
    stdout.push(strChunk);
    const match = previewUrlRegex.exec(strChunk);
    if (match !== null) {
      urlPromiseResolve(match[1]);
    }
  });
  previewProcess.stderr.on('data', (chunk) => {
    stderr.push(chunk.toString());
  });
  return {
    process: previewProcess,
    stdout,
    stderr,
    previewUrl: () => urlPromise,
    kill: () => {
      previewProcess.kill('SIGHUP');
    },
  };
};

// const install = async (projectFolder: string) => {
//   const pkgJson = await readPkgJson(projectFolder);
//   const deps = {
//     ...pkgJson.dependencies,
//     ...pkgJson.devDependencies,
//   };
//   const nodeModulesPath = join(projectFolder, 'node_modules');
//   await mkdir(nodeModulesPath, { recursive: true });
//   await Promise.all(
//     Object.entries(deps).map(async ([pkgName, pkgPath]) => {
//       if (!pkgPath.startsWith('file://')) {
//         throw new BuildError(
//           `Package path should be actual path to folder. See "${pkgName}". Path "${pkgPath}"`,
//         );
//       }
//       const orgPkgPath = pkgPath.replace('file://', '');
//       const targetPkgPath = join(nodeModulesPath, pkgName);
//       await mkdir(dirname(targetPkgPath), { recursive: true });
//       await symlink(orgPkgPath, targetPkgPath);
//     }),
//   );
// };
