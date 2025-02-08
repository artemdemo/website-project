import React, { useEffect } from 'react';
import { PageComponent } from 'site-builder/types';
import { TopMenu } from '../components/menu/TopMenu';
import { Banner } from '../components/banner/Banner';

const Posts: PageComponent = () => {
  useEffect(() => {
    console.log('Posts List');
  }, []);
  return (
    <>
      <Banner />
      <h1>Posts List</h1>
    </>
  );
};

export default Posts;
