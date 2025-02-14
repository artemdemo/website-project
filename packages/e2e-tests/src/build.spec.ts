import { describe, expect, it, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
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
    page = await browser.newPage();
  });

  afterEach(async () => {
    await page.close();
  });

  it('should work', async () => {
    const { cwd } = await driver.project.setup();
    await driver.npm.install(cwd);

    await driver.npm.build(cwd);

    const previewProcess = driver.npm.preview(cwd);

    previewProcess.stdout.on('data', (chunk) => {
      console.log('+=>', chunk.toString());
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));


    await page.goto('http://localhost:3000');
    expect(await page.title()).toBe('Mock title | Test Page');
    expect(await page.locator('#root h1').innerText()).toBe('Test Page');
    expect(await page.locator('#root p').innerText()).toBe('Some test content.');

    previewProcess.kill('SIGHUP');
  });
});
