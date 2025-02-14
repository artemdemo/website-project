// import { readPkgJson } from 'fs-utils';
// import { mkdir, symlink } from 'node:fs/promises';
// import { dirname, join } from 'node:path';
// import { BuildError } from 'error-reporter';

export const cliDriver = () => {
  return {
    npm: {
      execute,
    },
  };
};

const execute = (_args: string[], _options: {}) => {};
