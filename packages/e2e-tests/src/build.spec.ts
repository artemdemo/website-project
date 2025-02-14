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
// import { expect } from '@playwright/test';
import { testkit } from './infra/testkit';

let browser: Browser;
let page: Page;

describe('Build Command', () => {
  const { driver } = testkit();

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

    expect(await page.title()).toBe('Mock title | Test Page');
    expect(await page.locator('#root h1').innerText()).toBe('Test Page');
    expect(await page.locator('#root p').innerText()).toBe(
      'Some test content.',
    );

    previewProcess.kill();
  });
});
