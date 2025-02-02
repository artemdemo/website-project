import React, { useEffect } from 'react';
import { PageComponent } from 'site-builder/types';
import { TopMenu } from '../components/menu/TopMenu';

const Posts: PageComponent = () => {
  useEffect(() => {
    console.log('Posts List');
  }, []);
  return (
    <>
      <TopMenu />
      <h1>Posts List</h1>
    </>
  );
};

export default Posts;
