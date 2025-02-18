import { BuildError } from '@artemdemo/error-reporter';
import { replaceExt } from '@artemdemo/fs-utils';
import { existsSync } from 'node:fs';
import { outdent } from 'outdent';

export const tryFixJsImportPath = (pathToJSFile: string) => {
  if (existsSync(pathToJSFile)) {
    return pathToJSFile;
  }
  const mjsFilePath = replaceExt(pathToJSFile, '.mjs');
  if (existsSync(mjsFilePath)) {
    return mjsFilePath;
  }
  throw new BuildError(
    outdent`Provided path doesn't exist (Also checked with ".mjs" extension).
            Given "${pathToJSFile}"`,
  );
};

export const importJS = async (pathToJSFile: string) => {
  return import(tryFixJsImportPath(pathToJSFile));
};
