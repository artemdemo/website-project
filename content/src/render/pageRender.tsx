import React from 'react';
import { PageRenderFn } from 'site-builder/types';

export const pageRender: PageRenderFn = ({ content }) => {
  return (
    <div data-testid="Page">{content}</div>
  );
};
