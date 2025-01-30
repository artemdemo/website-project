import React, { useEffect } from 'react';
import { PageComponent } from 'site-builder/types';
import { TopMenu } from '../components/menu/TopMenu';

const Posts: PageComponent = ({ queryPages }) => {
  useEffect(() => {
    console.log('Posts List');
  }, []);
  return (
    <>
      <h1>Posts List</h1>
      <TopMenu queryPages={queryPages} />
    </>
  );
};

export default Posts;
