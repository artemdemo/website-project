import React, { useEffect } from 'react';
import { PageComponent } from 'site-builder/types';
import { QueryPagesMenu } from '../components/menu/QueryPagesMenu';

const Posts: PageComponent = ({ queryPages }) => {
  useEffect(() => {
    console.log('Posts List');
  }, []);
  return (
    <>
      <QueryPagesMenu queryPages={queryPages} />
      <h1>Posts List</h1>
    </>
  );
};

export default Posts;
