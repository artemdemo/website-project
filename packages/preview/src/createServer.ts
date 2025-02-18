import http from 'node:http';
import { existsSync, statSync, readFile } from 'node:fs';
import { normalize, join, parse } from 'node:path';
import { URL } from 'node:url';
import getPort from 'get-port';
import { getMimeType } from './mimeType.js';

export const createServer = async ({
  contentFolder = '',
  addTrailingSlash = true,
}: { contentFolder?: string; addTrailingSlash?: boolean } = {}) => {
  const port = await getPort({ port: 3000 });
  const cwd = process.cwd();

  http
    .createServer(function (req, res) {
      console.log(`${req.method} ${req.url}`);

      if (!req.url) {
        throw new Error(`Request URL is missing from the incoming request.`);
      }

      const parsedUrl = new URL(`http://localhost:${port}${req.url}`);

      // Static site should have slash at the end for every URL.
      // Otherwise it wouldn't be treated as directory by the browser,
      // and assets with relative URL will be loaded relative to the previous slash.
      if (addTrailingSlash && !parsedUrl.pathname.endsWith('/')) {
        const lastUrlPart = parsedUrl.pathname.split('/').at(-1);

        if (lastUrlPart && !lastUrlPart.includes('.')) {
          const redirectUrl = parsedUrl.pathname + '/';
          console.log(`Redirect to: ${redirectUrl}`);
          res.writeHead(301, { Location: redirectUrl });
          res.end();
          return;
        }
      }

      // extract URL path
      // Avoid https://en.wikipedia.org/wiki/Directory_traversal_attack
      // e.g curl --path-as-is http://localhost:9000/../fileInDanger.txt
      // by limiting the path to current directory only
      const sanitizePath = normalize(parsedUrl.pathname).replace(
        /^(\.\.[\/\\])+/,
        '',
      );
      let pathname = join(cwd, contentFolder, sanitizePath);

      if (existsSync(pathname)) {
        // if is a directory, then look for index.html
        if (statSync(pathname).isDirectory()) {
          const sep = pathname.endsWith('/') ? '' : '/';
          pathname += `${sep}index.html`;
        }

        // read file from file system
        readFile(pathname, (err, data) => {
          if (err) {
            res.statusCode = 500;
            res.end(`Error getting the file: ${err}.`);
          } else {
            // based on the URL path, extract the file extension. e.g. .js, .doc, ...
            const ext = parse(pathname).ext;
            // if the file is found, set Content-type and send data
            res.setHeader('Content-type', getMimeType(ext));
            res.end(data);
          }
        });
      } else {
        // if the file is not found, return 404
        res.statusCode = 404;
        res.end(`File ${pathname} not found!`);
        return;
      }
    })
    .listen(port);

  console.log(`Preview is running on http://localhost:${port}`);
};
