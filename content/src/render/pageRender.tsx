import React from 'react';
import { PageWrapperFn } from 'site-builder/types';

export const pageWrapper: PageWrapperFn = ({ content }) => {
  return <div data-testid="Page">{content}</div>;
};
