import { ReactNode } from 'react';
import { Page } from './page';
import { QueryPageResult, QueryTagResult } from './graphql';
import { PageConfig } from './page-config';

export type PageWrapperFn = (options: {
  pageConfig: PageConfig;
  content: ReactNode;
}) => ReactNode;
export type PageTitleRenderFn = (page: Page) => string;

export interface CreatePageOptions {
  templatePath: string;
  route: string;
  title: string;
  props?: Record<string, unknown>;
}

export type QuerySiteDataFn = (query: string) => Promise<{
  pages: Partial<QueryPageResult>[];
  tags: Partial<QueryTagResult>[];
}>;

export type RenderPagesFn = (options: {
  createPage: (options: CreatePageOptions) => void;
  querySiteData: QuerySiteDataFn;
}) => Promise<void>;

export type SiteRendererFn = () => {
  pageWrapper?: PageWrapperFn;
  pageTitleRender?: PageTitleRenderFn;
  renderPages?: RenderPagesFn;
};
