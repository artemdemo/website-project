import tsup from 'tsup';
import { getAppContext } from '../context';
import { isType } from 'variant';
import { join, format, parse } from 'node:path';
import { existsSync } from 'node:fs';
import { readFullPostContent } from '../readPost';
import { MdImport } from './mdTypes';

const importRegex = /import.+from\s+['"]([^'";]+)['"];?/gm;

export const buildMdxImports = async (): Promise<MdImport[]> => {
  const { model } = getAppContext();
  const imports: MdImport[] = [];

  for (const page of model?.pages) {
    if (isType(page, 'md')) {
      const fullPostContent = await readFullPostContent(page);
      let m = importRegex.exec(fullPostContent);
      while (m != null) {
        const importPath = m[1];
        imports.push({
          statement: m[0],
          importPath,
          targetImportPath: format({
            ...parse(join('target', 'md', 'src', importPath)),
            base: '',
            ext: '.js',
          }),
          positionIdx: m.index,
          mdFilePath: page.path,
        });
        m = importRegex.exec(fullPostContent);
      }
    }
  }

  await tsup.build({
    entry: imports.map((item) => {
      return join('src', item.importPath);
    }),
    esbuildOptions(options) {
      // the directory structure will be the same as the source
      options.outbase = './';
    },
    format: ['esm'],
    outDir: join('target', 'md'),
    external: ['react', 'react-dom'],
  });

  for (const importItem of imports) {
    const cssPath = format({
      ...parse(importItem.targetImportPath),
      base: '',
      ext: '.css',
    });

    if (existsSync(cssPath)) {
      importItem.cssPath = cssPath;
    }
  }

  return imports;
};
