import { replaceExt } from '@artemdemo/fs-utils';
import { existsSync } from 'node:fs';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PNG } from 'pngjs';
import { Page } from 'playwright';
import pixelmatch from 'pixelmatch';
import { outdent } from 'outdent';

const SCREENSHOTS_DIR = '__screenshots__';
const WIDTH = 1280;
const HEIGHT = 720;

const getScreenshot = async (name: string) => {
  if (!name.endsWith('.png')) {
    throw new Error(
      `Only PNG files are supported for screenshots. Given: "${name}"`,
    );
  }
  const screenshotPath = join('src', SCREENSHOTS_DIR, name);
  if (existsSync(screenshotPath)) {
    return PNG.sync.read(await readFile(screenshotPath));
  }
  return null;
};

export const compareScreenshots = async (
  page: Page,
  screenshotName: string,
) => {
  const existingScreenshot = await getScreenshot(screenshotName);

  if (existingScreenshot == null) {
    await page.screenshot({
      path: join('src', SCREENSHOTS_DIR, screenshotName),
    });
    console.log(`Created new screenshot "${screenshotName}"`);
    return;
  }

  const newScreenshotPath = join(
    'src',
    SCREENSHOTS_DIR,
    `${replaceExt(screenshotName, '')}_new.png`,
  );
  await page.screenshot({ path: newScreenshotPath });

  const diff = new PNG({ width: WIDTH, height: HEIGHT });
  const result = pixelmatch(
    PNG.sync.read(await readFile(newScreenshotPath)).data,
    existingScreenshot.data,
    diff.data,
    WIDTH,
    HEIGHT,
    { threshold: 0.1 },
  );

  if (result > 0) {
    const diffFilePath = join(
      'src',
      SCREENSHOTS_DIR,
      `${replaceExt(screenshotName, '')}_diff.png`,
    )
    await writeFile(
      diffFilePath,
      PNG.sync.write(diff),
    );
    throw new Error(outdent`
      Screenshots do not match.
      See "${diffFilePath}"
    `);
  } else {
    unlink(newScreenshotPath);
  }

  if (result !== 0) {
    throw new Error('Screenshots do not match');
  }
};
