import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { testkit } from '../infra/testkit';
import { join } from 'node:path';

describe('Build Command', () => {
  const { driver } = testkit();

  // ToDo: Add sanity test for a project ithw only one `tsx` page.
  it('should create minimal project', async () => {
    const { cwd } = await driver.project.setup();
    await driver.npm.install(cwd);

    await driver.npm.build(cwd);

    const htmlFilePath = join(cwd, 'build/index.html');

    expect(existsSync(htmlFilePath)).toBe(true);

    const html = await readFile(join(cwd, 'build/index.html'), {
      encoding: 'utf-8',
    });

    expect(html).toContain('<title>Mock title | Test Page</title>');
    expect(html).toContain('<h1>Test Page</h1>');
    expect(html).toContain('<p>Some test content.</p>');
  });
});
