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
import { expect as playExpect } from '@playwright/test';
import { testkit } from './infra/testkit';
import { join } from 'node:path';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { outdent } from 'outdent';

let browser: Browser;
let page: Page;

describe('Build e2e', () => {
  const { driver, builders } = testkit();

  beforeAll(async () => {
    browser = await chromium.launch({
      headless: false,
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

    expect(await page.title()).toBe('Mock title | Test Page');
    expect(await page.locator('#root h1').innerText()).toBe('Test Page');
    expect(await page.locator('#root p').innerText()).toBe(
      'Some test content.',
    );

    previewProcess.kill();
  });

  // ToDo: Looks like this test needs to run wrapped in `test()` method from `@playwright/test`.
  // But it means that creating of the test project should happen before in a separate process.
  it.skip('should render bg image in imported component', async () => {
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

    console.log('>> cwd', cwd);

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

    await writeFile(
      join(componentDirPath, 'Banner.css'),
      outdent`
        .Banner {
          width: 100%;
          height: 70px;
          color: rgba(255, 255, 255, 0.413);
          background-image: url('./test-bg.jpg');
        }
      `,
      { encoding: 'utf-8' },
    );

    await copyFile(
      join('src', 'fixtures', 'test-bg.jpg'),
      join(componentDirPath, 'test-bg.jpg'),
    );

    await driver.npm.install(cwd);
    await driver.npm.build(cwd);

    const previewProcess = driver.npm.preview(cwd);
    const previewUrl = await previewProcess.previewUrl();

    await page.goto(previewUrl);

    await playExpect(page).toHaveScreenshot();
  });
});
