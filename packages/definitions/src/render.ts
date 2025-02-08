import { ReactNode } from 'react';
import { Page } from './page';
import { QueryPageResult } from './graphql';

export type PageWrapperFn = (options: { content: ReactNode }) => ReactNode;
export type PageTitleRenderFn = (page: Page) => string;

export interface CreatePageOptions {
  templatePath: string;
  route: string;
  props?: Record<string, unknown>;
}

export type RenderPagesFn = (options: {
  createPage: (options: CreatePageOptions) => void;
  queryPages: (query: string) => Promise<Partial<QueryPageResult>[]>;
}) => Promise<void>;

export type SiteRendererFn = () => {
  pageWrapper: PageWrapperFn;
  pageTitleRender?: PageTitleRenderFn;
  renderPages?: RenderPagesFn;
};
