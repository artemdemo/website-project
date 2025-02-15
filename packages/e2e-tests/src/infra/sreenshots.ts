import { replaceExt } from '@artemdemo/fs-utils';
import { existsSync } from 'node:fs';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PNG } from 'pngjs';
import { Page } from 'playwright';
import pixelmatch from 'pixelmatch';

const SCREENSHOTS_DIR = '__screenshots__';
const WIDTH = 1280;
const HEIGHT = 720;

const getScreenshot = async (name: string) => {
  if (!name.endsWith('.png')) {
    throw new Error(
      `Screenshot file is supported only for PNG files. Given: "${name}"`,
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
): Promise<number> => {
  const existingScreenshot = await getScreenshot(screenshotName);

  if (existingScreenshot == null) {
    await page.screenshot({
      path: join('src', SCREENSHOTS_DIR, screenshotName),
    });
    return 0;
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
    await writeFile(
      join(
        'src',
        SCREENSHOTS_DIR,
        `${replaceExt(screenshotName, '')}_diff.png`,
      ),
      PNG.sync.write(diff),
    );
  } else {
    unlink(newScreenshotPath);
  }

  return result;
};
