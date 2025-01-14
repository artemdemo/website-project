import { ReactNode } from 'react';

export type PageRenderFn = (options: { content: ReactNode }) => ReactNode;

export type SiteRendererFn = () => {
  pageRender: PageRenderFn;
};
