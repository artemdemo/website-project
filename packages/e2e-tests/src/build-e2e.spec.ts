import {
  describe,
  expect,
  it,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from 'vitest';
import { chromium, Browser, Page } from 'playwright';
import { join } from 'node:path';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { outdent } from 'outdent';
import { testkit } from './infra/testkit';
import { compareScreenshots } from './infra/screenshots';

let browser: Browser;
let page: Page;

describe('Build e2e', () => {
  const { driver, builders } = testkit();

  beforeAll(async () => {
    browser = await chromium.launch({
      headless: true,
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage({
      screen: {
        width: 800,
        height: 600,
      },
    });
  });

  afterEach(async () => {
    await page.close();
  });

  it('should preview page in the browser', async () => {
    const { cwd } = await driver.project.setup();
    await driver.npm.install(cwd);
    await driver.npm.build(cwd);

    const previewProcess = driver.npm.preview(cwd);
    const previewUrl = await previewProcess.previewUrl();

    await page.goto(previewUrl);

    // ToDo: This not always works
    //    Regrdless, killing of the preview should happen automatically
    //    Maybe store PID of the process and then kill it?
    previewProcess.kill();

    expect(await page.title()).toBe('Mock title | Test Page');
    expect(await page.locator('#root h1').innerText()).toBe('Test Page');
    expect(await page.locator('#root p').innerText()).toBe(
      'Some test content.',
    );
  });

  it('should render bg image in imported component', async () => {
    const { cwd } = await driver.project.setup({
      pages: {
        '/': builders.dashboardPage({
          content: outdent`
            import React from 'react';
            import { PageComponent } from 'site-builder/types';
            import { Banner } from '../components/banner/Banner';

            const Page: PageComponent = () => {
              return (
                <>
                  <Banner />
                  <h1>Home Page</h1>
                </>
              );
            };

            export default Page;
          `,
          type: 'tsx',
          config: {
            title: 'Home Page',
          },
        }),
      },
    });

    const componentDirPath = join(cwd, 'src', 'components', 'banner');
    await mkdir(componentDirPath, { recursive: true });

    await writeFile(
      join(componentDirPath, 'Banner.tsx'),
      outdent`
        import React from 'react';
        import './Banner.css';

        export const Banner = () => {
          return <p className="Banner">Banner</p>;
        };
      `,
      { encoding: 'utf-8' },
    );

    const testBgJpg = 'test-bg.jpg';

    await writeFile(
      join(componentDirPath, 'Banner.css'),
      outdent`
        .Banner {
          width: 100%;
          height: 70px;
          color: rgba(255, 255, 255, 0.413);
          background-image: url('./${testBgJpg}');
        }
      `,
      { encoding: 'utf-8' },
    );

    await copyFile(
      join('src', 'fixtures', testBgJpg),
      join(componentDirPath, testBgJpg),
    );

    await driver.npm.install(cwd);
    await driver.npm.build(cwd);

    const previewProcess = driver.npm.preview(cwd);
    const previewUrl = await previewProcess.previewUrl();

    await page.goto(previewUrl);

    // ToDo: This not always works
    //    Regardless, killing of the preview should happen automatically
    //    Maybe store PID of the process and then kill it?
    previewProcess.kill();

    await compareScreenshots(page, 'css-bg-banner.png');
  });

  it('should render css with bg image in component from "site.render"', async () => {
    const { cwd } = await driver.project.setup({
      siteRender: {
        pageWrapper: outdent`
          import React from 'react';
          import { PageWrapperFn } from 'site-builder/types';
          import { Banner } from './components/banner/Banner';

          export const pageWrapper: PageWrapperFn = ({ content }) => {
            return (
              <div data-testid="page-wrapper">
                <Banner />
                {content}
              </div>
            );
          };
        `,
      },
    });

    const componentDirPath = join(cwd, 'src', 'components', 'banner');
    await mkdir(componentDirPath, { recursive: true });

    await writeFile(
      join(componentDirPath, 'Banner.tsx'),
      outdent`
        import React from 'react';
        import './Banner.css';

        export const Banner = () => {
          return <p className="Banner">Banner</p>;
        };
      `,
      { encoding: 'utf-8' },
    );

    const testBgJpg = 'test-bg.jpg';

    await writeFile(
      join(componentDirPath, 'Banner.css'),
      outdent`
        .Banner {
          width: 100%;
          height: 70px;
          color: rgba(255, 255, 255, 0.413);
          background-image: url('./${testBgJpg}');
        }
      `,
      { encoding: 'utf-8' },
    );

    await copyFile(
      join('src', 'fixtures', testBgJpg),
      join(componentDirPath, testBgJpg),
    );

    await driver.npm.install(cwd);
    await driver.npm.build(cwd);

    const previewProcess = driver.npm.preview(cwd);
    const previewUrl = await previewProcess.previewUrl();

    await page.goto(previewUrl);

    // ToDo: This not always works
    //    Regrdless, killing of the preview should happen automatically
    //    Maybe store PID of the process and then kill it?
    previewProcess.kill();

    await compareScreenshots(page, 'site-render-page-wrapper-bg-banner.png');
  });
});
