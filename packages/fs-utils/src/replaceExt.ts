import { format, parse } from 'node:path';

export const replaceExt = (filePath: string, ext: '.js' | '.css' | '') => {
  return format({
    ...parse(filePath),
    base: '',
    ext,
  });
};
