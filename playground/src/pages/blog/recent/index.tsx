import React from 'react';
import type { PageComponent, PageQuery } from 'site-builder/types';

export const query: PageQuery = () => `{
  pages(limit: 5, filter: { categories: ["blog"] }) {
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

const Blog: PageComponent = ({ queriedPages }) => {
  return (
    <>
      <h1>Recent Blog Posts</h1>
      {queriedPages.map((page) => (
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
    </>
  );
};

export default Blog;
