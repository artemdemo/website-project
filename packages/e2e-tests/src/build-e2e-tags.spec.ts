import {
  describe,
  it,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from 'vitest';
import { chromium, Browser, Page } from 'playwright';
import { outdent } from 'outdent';
import { testkit } from './infra/testkit';
import { join } from 'node:path';
import { compareScreenshots } from './infra/screenshots';
import { writeFile } from 'fs/promises';
import { mkdir } from 'node:fs/promises';

let browser: Browser;
let page: Page;

describe('Build e2e tags', () => {
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

  it('should render tags pages', async () => {
    const { cwd } = await driver.project.setup({
      pages: {
        '/': builders.dashboardPage(),
        '/one': builders.dashboardPage({
          content: outdent`# Page One`,
          config: {
            title: 'Page One',
            tags: ['foo']
          },
        }),
        '/two': builders.dashboardPage({
          content: outdent`# Page Two`,
          config: {
            title: 'Page Two',
            tags: ['foo']
          },
        }),
        '/three': builders.dashboardPage({
          content: outdent`# Page Three`,
          config: {
            title: 'Page Three',
            tags: ['boo']
          },
        }),
      },
      siteRender: {
        pageWrapper: outdent`
          import React from 'react';
          import { PageWrapperFn } from 'site-builder/types';

          export const pageWrapper: PageWrapperFn = ({ content, pageConfig }) => {
            return (
              <div data-testid="page-wrapper">
                <h2>{pageConfig.title}</h2>
                {content}
              </div>
            );
          };
        `,
        renderPages: outdent`
          export const renderPages = async ({ createPage, querySiteData }) => {
            const { tags } = await querySiteData(\`{
              tags {
                name
              }
            }\`);

            for (const tag of tags) {
              const query = \`{
                pages(limit: 0, filter: { tags: ["\${tag.name}"] }) {
                  route
                  excerpt
                  thumbnail
                  config {
                    title
                  }
                }
              }\`;
              const { pages } = await querySiteData(query);
              createPage({
                templatePath: 'src/templates/tagPage.tsx',
                route: \`/tag/\${tag.name}\`,
                title: \`Tag Page: "\${tag.name}"\`,
                props: {
                  pages: pages,
                },
              });
            }
          };
        `,
      },
    });

    const templatesDir = join(cwd, 'src', 'templates');

    await mkdir(templatesDir, { recursive: true });

    await writeFile(
      join(templatesDir, 'tagPage.tsx'),
      outdent`
        import React from 'react';

        const tagPage: React.FC<{
          pages: {
            route: string;
            excerpt: string;
            thumbnail: string;
            config: { title: string };
          }[];
        }> = ({ pages }) => {
          return (
            <div>
              {pages.map((page) => (
                <div key={page.route}>
                  <h3>
                    <a href={page.route + '/'}>{page.config?.title}</a>
                  </h3>
                  {page.thumbnail && <img src={page.route! + '/' + page.thumbnail} />}
                  {page.excerpt && (
                    <p dangerouslySetInnerHTML={{ __html: page.excerpt || '' }}></p>
                  )}
                </div>
              ))}
            </div>
          );
        };

        export default tagPage;
      `,
      { encoding: 'utf-8' },
    );

    await driver.npm.install(cwd);
    await driver.npm.build(cwd);


    const previewProcess = driver.npm.preview(cwd);
    const previewUrl = await previewProcess.previewUrl();

    await page.goto(`${previewUrl}/tag/foo`);

    await compareScreenshots(
      page,
      'build-e2e-tags-foo.png',
    );

    await page.goto(`${previewUrl}/tag/boo`);

    await compareScreenshots(
      page,
      'build-e2e-tags-boo.png',
    );

    // ToDo: This not always works
    //    Regrdless, killing of the preview should happen automatically
    //    Maybe store PID of the process and then kill it?
    // previewProcess.kill();
  });
});
