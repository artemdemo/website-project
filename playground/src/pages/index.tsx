import React, { useEffect } from 'react';
import { PageComponent } from 'site-builder/types';
import { TopMenu } from '../components/menu/TopMenu';
import { Banner } from '../components/banner/Banner';

const Posts: PageComponent = () => {
  return (
    <>
      <Banner />
      <h1>Home Page</h1>
    </>
  );
};

export default Posts;
