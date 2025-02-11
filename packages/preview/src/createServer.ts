import http from 'node:http';
import { existsSync,  statSync, readFile } from 'node:fs';
import { normalize, join, parse } from 'node:path';
import { URL } from 'node:url';
import getPort from 'get-port';
import { getMimeType } from './mimeType.js';

export const createServer = async () => {
  const port = await getPort();
  const cwd = process.cwd();

  http.createServer(function (req, res) {
    console.log(`${req.method} ${req.url}`);

    if (!req.url) {
      throw new Error(`Request URL is not provided`);
    }

    const parsedUrl = new URL(`http://localhost:${port}${req.url}`);

    // extract URL path
    // Avoid https://en.wikipedia.org/wiki/Directory_traversal_attack
    // e.g curl --path-as-is http://localhost:9000/../fileInDanger.txt
    // by limiting the path to current directory only
    const sanitizePath = normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
    let pathname = join(cwd, sanitizePath);

    if (existsSync(pathname)) {
      // if is a directory, then look for index.html
      if (statSync(pathname).isDirectory()) {
        pathname += '/index.html';
      }

      // read file from file system
      readFile(pathname, (err, data) => {
        if(err){
          res.statusCode = 500;
          res.end(`Error getting the file: ${err}.`);
        } else {
          // based on the URL path, extract the file extention. e.g. .js, .doc, ...
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

  }).listen(port);

  console.log(`Preview is running on http://localhost:${port}`);
};
