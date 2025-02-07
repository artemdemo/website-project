import { ReactNode } from 'react';
import { Page } from './page';
import { QueryPageResult } from './graphql';

export type PageWrapperFn = (options: { content: ReactNode }) => ReactNode;
export type PageTitleRenderFn = (page: Page) => string;

export type RenderPagesFn = (options: {
  createPage: (options: {
    templatePath: string;
    props?: Record<string, unknown>;
  }) => Promise<void>;
  queryPages: (query: string) => Promise<Partial<QueryPageResult>[]>;
}) => Promise<void>;

export type SiteRendererFn = () => {
  pageWrapper: PageWrapperFn;
  pageTitleRender?: PageTitleRenderFn;
  renderPages?: RenderPagesFn;
};
