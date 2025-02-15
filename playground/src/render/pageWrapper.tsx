import React from 'react';
import { PageWrapperFn } from 'site-builder/types';
import { Banner } from '../components/banner/Banner';
import { TopMenu } from '../components/menu/TopMenu';
import { PageTags } from '../components/tags/PageTags';

export const pageWrapper: PageWrapperFn = ({ pageConfig, content }) => {
  return (
    <div data-testid="Page">
      <TopMenu />
      <Banner />
      <h2>{pageConfig.title}</h2>
      <PageTags tags={pageConfig.tags} />
      {content}
    </div>
  );
};
