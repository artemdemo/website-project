import React from 'react';
import type { PageComponent, PageQuery } from 'site-builder/types';
import { TopMenu } from '../../components/menu/TopMenu';

export const query: PageQuery = () => `{
  pages(limit: 10, filter: { categories: ["blog"] }) {
    route
    path
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
        <p key={page.path}>
          {page.config?.title}
        </p>
      ))}

      <a href="#">All posts</a>
    </>
  );
};

export default Blog;
