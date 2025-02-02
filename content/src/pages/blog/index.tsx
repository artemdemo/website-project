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
  console.log('Blog >', queriedPages);
  return (
    <>
      <TopMenu />
      <h1>Blog Posts</h1>
    </>
  );
};

export default Blog;
