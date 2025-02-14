import { format, parse } from 'node:path';

export const replaceExt = (
  filePath: string,
  ext: '.js' | '.mjs' | '.css' | '',
) => {
  return format({
    ...parse(filePath),
    base: '',
    ext,
  });
};
