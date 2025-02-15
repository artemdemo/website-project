import { SiteRendererFn } from 'site-builder/types';
import { pageWrapper } from './render/pageWrapper';
import { renderPages } from './render/renderPages';

const siteRenderer: SiteRendererFn = () => {
  return {
    pageWrapper,
    renderPages,
  };
};

export default siteRenderer;
