import React, { useEffect } from 'react';
import { PageComponent } from 'site-builder/types';

const Posts: PageComponent = ({ queryPages }) => {
  useEffect(() => {
    console.log('Posts List');
  }, []);
  return (
    <>
      <h1>Posts List</h1>
      <div>
        {queryPages().map((page) => (
          <div key={page.path}>
            "{page.config.title}" - {page.relativePath}
          </div>
        ))}
      </div>
    </>
  );
};

export default Posts;
