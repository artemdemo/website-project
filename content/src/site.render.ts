import { SiteRendererFn } from 'site-builder/types';
import { pageRender } from './render/pageRender';

const siteRenderer: SiteRendererFn = () => {
  return {
    pageRender,
  };
};

export default siteRenderer;
