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

  it.only('should render bg image in imported component on MD page', async () => {
    const { cwd } = await driver.project.setup({
      pages: {
        '/': builders.dashboardPage({
          content: outdent`
          import { Banner } from './components/banner/Banner.tsx';

          <Banner />

          # Test Page

          Some test content.
        `,
          type: 'md',
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

    const testBgJpg = 'img-01.jpg';

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

    await compareScreenshots(page, 'css-bg-banner-md-page.png');
  });
});
