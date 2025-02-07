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
        <div key={page.route}>
          <h3>{page.config?.title}</h3>
          <p dangerouslySetInnerHTML={{ __html: page.excerpt || ''}}></p>
        </div>
      ))}

      <a href="#">All posts</a>
    </>
  );
};

export default Blog;
