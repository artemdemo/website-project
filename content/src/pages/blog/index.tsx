import React from 'react';
import type { PageComponent, PageQuery } from 'site-builder/types';
import { TopMenu } from '../../components/menu/TopMenu';

export const query: PageQuery = () => `{
  pages(limit: 10, filter: { categories: ["blog"] }) {
    route
    excerpt
    config {
      title
      date
      featuredImage
      tags
      categories
    }
  }
}`;

const Blog: PageComponent = ({ queriedPages }) => {
  return (
    <>
      <TopMenu />
      <h1>Recent Blog Posts</h1>
      {queriedPages.map((page) => (
        <div>
          <h3 key={page.route}>{page.config?.title}</h3>
          <p></p>
        </div>
      ))}

      <a href="#">All posts</a>
    </>
  );
};

export default Blog;
