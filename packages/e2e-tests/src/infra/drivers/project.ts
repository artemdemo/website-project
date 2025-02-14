import { dirname, join } from 'node:path';
import { temporaryDirectory } from 'tempy';
import { mkdir, writeFile } from 'node:fs/promises';
import { writeJson, writePkgJson } from 'fs-utils';
import { match } from 'variant';
import { dashboardPage, PageBuild } from '../builders/page';

export const projectDriver = () => {
  return {
    project: {
      setup,
    },
  };
};

export type SetupOptions = {
  pages?: Record<string, PageBuild>;
};

const setup = async ({
  pages = { '/': dashboardPage() },
}: SetupOptions = {}) => {
  const projectFolder = temporaryDirectory();
  const pkgJson = {
    dependencies: {
      'site-builder': `file://${dirname(require.resolve('site-builder/package.json'))}`,
    },
  };

  await writePkgJson(pkgJson, projectFolder);

  await writeJson(
    {
      extends: 'site-builder/tsconfig.user.json',
      include: ['src'],
    },
    join(projectFolder, 'tsconfig.json'),
  );

  await renderPages(projectFolder, pages);

  return { cwd: projectFolder };
};

const renderPages = async (
  projectFolder: string,
  pages: Record<string, PageBuild>,
) => {
  const pagesDirPath = join(projectFolder, 'src', 'pages');
  for (const [path, pageBuild] of Object.entries(pages)) {
    const currentPageDirPath = join(pagesDirPath, path);
    await mkdir(currentPageDirPath, { recursive: true });
    const pageFileName = match(pageBuild.type, {
      md: () => 'index.md',
      tsx: () => 'index.tsx',
    });
    await writeFile(
      pageBuild.content,
      join(currentPageDirPath, pageFileName),
      'utf-8',
    );
    await writeJson(pageBuild.config, join(currentPageDirPath, 'index.json'));
  }
};
