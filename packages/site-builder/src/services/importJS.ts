import { replaceExt } from 'fs-utils';
import { existsSync } from 'node:fs';

export const importJS = async (pathToJSFile: string) => {
  return import(
    existsSync(pathToJSFile)
      ? pathToJSFile
      : replaceExt(pathToJSFile, '.mjs')
  )
};
