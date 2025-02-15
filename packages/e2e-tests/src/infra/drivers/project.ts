import { dirname, join } from 'node:path';
import { temporaryDirectory } from 'tempy';
import { mkdir, writeFile } from 'node:fs/promises';
import { writeJson, writePkgJson } from '@artemdemo/fs-utils';
import { match } from 'variant';
import { outdent } from 'outdent';
import { dashboardPage, PageBuild } from '../builders/page';
import {
  EXCERPT_FILE,
  PAGE_CONFIG_FILE,
  SITE_CONFIG_FILE,
  SITE_RENDER_TS,
  SiteConfig,
} from '@artemdemo/definitions';

export const projectDriver = () => {
  return {
    project: {
      setup,
    },
  };
};

type SiteRender = {
  pageWrapper?: string;
  pageTitleRender?: string;
  renderPages?: string;
};

export type SetupOptions = {
  pages?: Record<string, PageBuild>;
  siteConfig?: Partial<SiteConfig>;
  siteRender?: SiteRender;
};

const setup = async ({
  pages = { '/': dashboardPage() },
  siteConfig,
  siteRender,
}: SetupOptions = {}) => {
  const projectFolder = temporaryDirectory();
  const pkgJson = {
    dependencies: {
      'site-builder': `file://${dirname(require.resolve('site-builder/package.json'))}`,
      react: `file://${dirname(require.resolve('react/package.json'))}`,
      'react-dom': `file://${dirname(require.resolve('react-dom/package.json'))}`,
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

  await mkdir(join(projectFolder, 'src'));

  await renderSiteRender(projectFolder, siteRender);

  await renderSiteConfig(projectFolder, siteConfig);

  await renderPages(projectFolder, pages);

  return { cwd: projectFolder };
};

const renderSiteRender = async (
  projectFolder: string,
  siteRender?: Partial<SiteRender>,
) => {
  if (siteRender?.pageWrapper) {
    await writeFile(
      join(projectFolder, 'src', 'pageWrapper.tsx'),
      siteRender.pageWrapper,
      'utf-8',
    );
  }

  if (siteRender?.renderPages) {
    await writeFile(
      join(projectFolder, 'src', 'renderPages.tsx'),
      siteRender.renderPages,
      'utf-8',
    );
  }

  if (siteRender) {
    await writeFile(
      join(projectFolder, 'src', SITE_RENDER_TS),
      outdent`
        import { SiteRendererFn } from 'site-builder/types';
        ${siteRender.pageWrapper ? `import { pageWrapper } from './pageWrapper.js';` : ''}
        ${siteRender.renderPages ? `import { renderPages } from './renderPages.js';` : ''}

        const siteRenderer: SiteRendererFn = () => {
          return {
            ${siteRender.pageWrapper ? 'pageWrapper,' : ''}
            ${siteRender.renderPages ? 'renderPages,' : ''}
          };
        };
        export default siteRenderer;
      `,
      'utf-8',
    );
  }
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
    await writeJson(
      join(currentPageDirPath, PAGE_CONFIG_FILE),
      pageBuild.config,
    );
    if (pageBuild.excerpt) {
      await writeFile(
        join(currentPageDirPath, EXCERPT_FILE),
        pageBuild.excerpt,
        'utf-8',
      );
    }
  }
};
