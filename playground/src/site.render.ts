import { SiteRendererFn } from 'site-builder/types';
import { pageWrapper } from './render/pageRender';
import { renderPages } from './render/renderPages';

const siteRenderer: SiteRendererFn = () => {
  return {
    pageWrapper,
    renderPages,
  };
};

export default siteRenderer;
