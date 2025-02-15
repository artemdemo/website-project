import { RenderPagesFn } from 'site-builder/types';

const POSTS_PER_PAGE = 5;

const blogPages: RenderPagesFn = async ({ createPage, querySiteData }) => {
  const query = `{
    pages(limit: 0, filter: { categories: ["blog"] }) {
      route
      excerpt
      thumbnail
      config {
        title
        date
        tags
        categories
      }
    }
  }`;
  const { pages } = await querySiteData(query);

  const amountOfPaginatioPages = Math.ceil(pages.length / POSTS_PER_PAGE);

  if (pages.length > 0) {
    createPage({
      templatePath: 'src/templates/blogPaginationPage.tsx',
      route: `/blog`,
      title: `Blog Page`,
      props: {
        pages: pages.slice(0, POSTS_PER_PAGE),
        pagination: {
          currentPageIdx: 0,
          totalPages: amountOfPaginatioPages,
        },
      },
    });
  }

  for (let pageIdx = 0; pageIdx < amountOfPaginatioPages; pageIdx++) {
    createPage({
      templatePath: 'src/templates/blogPaginationPage.tsx',
      route: `/blog/page/${pageIdx + 1}`,
      title: `Blog Page: ${pageIdx + 1}`,
      props: {
        pages: pages.slice(
          pageIdx * POSTS_PER_PAGE,
          (pageIdx + 1) * POSTS_PER_PAGE,
        ),
        pagination: {
          currentPageIdx: pageIdx,
          totalPages: amountOfPaginatioPages,
        },
      },
    });

    // pageIdx = 0:
    //   postIdx = 0; postIdx < 5;
    //   postIdx = 5; postIdx < 10;
    // for (let postIdx = pageIdx * POSTS_PER_PAGE; postIdx < pageIdx * POSTS_PER_PAGE + POSTS_PER_PAGE; postIdx++) {
    //   if (pages[postIdx]) {}
    // }
  }
};

const tagPages: RenderPagesFn = async ({ createPage, querySiteData }) => {
  const { tags } = await querySiteData(`{
    tags {
      name
    }
  }`);

  for (const tag of tags) {
    const query = `{
      pages(limit: 0, filter: { tags: ["${tag.name}"] }) {
        route
        excerpt
        thumbnail
        config {
          title
          date
          tags
          categories
        }
      }
    }`;
    const { pages } = await querySiteData(query);
    createPage({
      templatePath: 'src/templates/tagPage.tsx',
      route: `/blog/tag/${tag.name}`,
      title: `Tag Page: "${tag.name}"`,
      props: {
        pages: pages,
      },
    });
  }
};

export const renderPages: RenderPagesFn = async (options) => {
  await blogPages(options);
  await tagPages(options);
};
