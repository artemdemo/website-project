import { dirname, join } from 'node:path';
import { temporaryDirectory } from 'tempy';
import { mkdir, writeFile } from 'node:fs/promises';
import { writeJson, writePkgJson } from 'fs-utils';
import { match } from 'variant';
import { dashboardPage, PageBuild } from '../builders/page';
import { SITE_CONFIG_FILE, SiteConfig } from 'definitions';

export const projectDriver = () => {
  return {
    project: {
      setup,
    },
  };
};

export type SetupOptions = {
  pages?: Record<string, PageBuild>;
  siteConfig?: Partial<SiteConfig>;
};

const setup = async ({
  pages = { '/': dashboardPage() },
  siteConfig,
}: SetupOptions = {}) => {
  const projectFolder = temporaryDirectory();
  const pkgJson = {
    dependencies: {
      'site-builder': `file://${dirname(require.resolve('site-builder/package.json'))}`,
      react: '^19.0.0',
      'react-dom': '^19.0.0',
    },
    scripts: {
      build: 'site-builder build',
      preview: 'site-builder preview',
    },
  };

  await writePkgJson(projectFolder, pkgJson);

  await writeJson(
    join(projectFolder, 'tsconfig.json'),
    {
      extends: 'site-builder/tsconfig.user.json',
      include: ['src'],
    },
    { spaces: 2 },
  );

  await renderSiteConfig(projectFolder, siteConfig);

  await renderPages(projectFolder, pages);

  return { cwd: projectFolder };
};

const renderSiteConfig = async (
  projectFolder: string,
  siteConfig: Partial<SiteConfig> = {},
) => {
  await writeJson(
    join(projectFolder, SITE_CONFIG_FILE),
    {
      titlePrefix: 'Mock title',
      metaDescription: 'Site mock description',
      ...siteConfig,
    },
    { spaces: 2 },
  );
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
      join(currentPageDirPath, pageFileName),
      pageBuild.content,
      'utf-8',
    );
    await writeJson(join(currentPageDirPath, 'index.json'), pageBuild.config);
  }
};
