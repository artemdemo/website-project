import { RenderPagesFn } from 'site-builder/types';

const POSTS_PER_PAGE = 5;

export const renderPages: RenderPagesFn = async ({
  createPage,
  queryPages,
}) => {
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
  const pages = await queryPages(query);

  const amountOfPaginatioPages = Math.ceil(pages.length / POSTS_PER_PAGE);

  for (let pageIdx = 0; pageIdx < amountOfPaginatioPages; pageIdx++) {
    createPage({
      templatePath: 'src/templates/blogPaginationPage.tsx',
      route: `/blog/page/${pageIdx + 1}`,
      title: `Blog Page: ${pageIdx + 1}`,
      props: {
        pages,
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
