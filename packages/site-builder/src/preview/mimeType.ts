// import { z } from 'zod';

// export const fileExtSchema = z.union([
//   z.literal('.ico'),
//   z.literal('.html'),
//   z.literal('.js'),
//   z.literal('.json'),
//   z.literal('.css'),
//   z.literal('.png'),
//   z.literal('.jpg'),
//   z.literal('.wav'),
//   z.literal('.mp3'),
//   z.literal('.svg'),
//   z.literal('.pdf'),
//   z.literal('.zip'),
//   z.literal('.doc'),
//   z.literal('.eot'),
//   z.literal('.ttf'),
// ]);

// export type FileExt = z.infer<typeof fileExtSchema>;

// maps file extention to MIME types
// full list can be found here: https://www.freeformatter.com/mime-types-list.html
const mimeType: Record<string, string> = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.doc': 'application/msword',
  '.eot': 'application/vnd.ms-fontobject',
  '.ttf': 'application/x-font-ttf',
};

export const getMimeType = (fileExt: string): string => {
  if (mimeType[fileExt] == undefined) {
    return 'text/plain';
  }

  return mimeType[fileExt];
};


