import React from 'react';
import { PageComponent } from 'site-builder/types';
import { TopMenu } from '../../components/menu/TopMenu';

const Blog: PageComponent = ({ queryPages }) => {
  return (
    <>
      <TopMenu />
      <h1>Blog Posts</h1>
    </>
  );
};

export default Blog;
