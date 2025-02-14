import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { outdent } from 'outdent';
import { testkit } from './infra/testkit';

describe('Build Sanity', () => {
  const { driver, builders } = testkit();

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

  it('should create minimal project', async () => {
    const { cwd } = await driver.project.setup({
      pages: {
        '/': builders.dashboardPage({
          content: outdent`
            import React from 'react';
            import { PageComponent } from 'site-builder/types';

            const Page: PageComponent = () => {
              return <h1>Home Page</h1>;
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
    await driver.npm.install(cwd);

    await driver.npm.build(cwd);

    const htmlFilePath = join(cwd, 'build/index.html');

    expect(existsSync(htmlFilePath)).toBe(true);

    const html = await readFile(join(cwd, 'build/index.html'), {
      encoding: 'utf-8',
    });

    expect(html).toContain('<title>Mock title | Home Page</title>');
    expect(html).toContain('<h1>Home Page</h1>');
  });
});
