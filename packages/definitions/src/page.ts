import React from 'react';
import { VariantOf, variant, fields } from 'variant';
import { PageConfig } from './page-config';
import { QuerySiteDataFn } from './render';

export interface PageFields {
  route: string;
  path: string;
  relativePath: string;
  excerptPath?: string;
  thumbnailPath?: string;
  config: PageConfig;
}

export const Page = variant({
  tsx: fields<PageFields>(),
  md: fields<PageFields>(),
});
export type Page = VariantOf<typeof Page>;

export type PageProps = {
  queriedResults: Partial<Awaited<ReturnType<QuerySiteDataFn>>>;
};

export type PageQuery = () => string;

export type PageComponent = React.FC<PageProps>;

export const PageAsset = variant({
  css: fields<{
    path: string;
  }>(),
});
export type PageAsset = VariantOf<typeof PageAsset>;
