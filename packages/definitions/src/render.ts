import { ReactNode } from 'react';
import { Page } from './page';

export type PageRenderFn = (options: { content: ReactNode }) => ReactNode;
export type PageTitleRenderFn = (page: Page) => string;

export type SiteRendererFn = () => {
  pageRender: PageRenderFn;
  pageTitleRender?: PageTitleRenderFn;
};
