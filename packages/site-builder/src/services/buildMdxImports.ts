import tsup from 'tsup';
import { getAppContext } from './context';
import { isType } from 'variant';
import { join, format, parse } from 'node:path';
import { readFullPostContent } from './readPost';

type Import = {
  importPath: string;
  targetImportPath: string;
  statement: string;
  positionIdx: number;
  mdFilePath: string;
};

const importRegex = /import.+from\s+['"]([^'";]+)['"];?/gm;

export const buildMdxImports = async (): Promise<Import[]> => {
  const { model } = getAppContext();
  const imports: Import[] = [];

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

  return imports;
};
