import React from 'react';
import { PageWrapperFn } from 'site-builder/types';
import { TopMenu } from '../components/menu/TopMenu';

export const pageWrapper: PageWrapperFn = ({ content }) => {
  return (
    <div data-testid="Page">
      <TopMenu />
      {content}
    </div>
  );
};
