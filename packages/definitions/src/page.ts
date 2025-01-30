import React from 'react';
import { VariantOf, variant, fields } from 'variant';
import { z } from 'zod';

export const pageConfigSchema = z.object({
  title: z.string(),
  date: z.string().optional(),
  featuredImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type PageConfig = z.infer<typeof pageConfigSchema>;

interface PageFields {
  route: string;
  path: string;
  relativePath: string;
  config: PageConfig;
}

export const Page = variant({
  tsx: fields<PageFields>(),
  md: fields<PageFields>(),
});
export type Page = VariantOf<typeof Page>;

export type QueryPagesFn = () => Array<PageFields>;

export type PageProps = {
  queryPages: QueryPagesFn;
};

export type PageComponent = React.FC<PageProps>;

export const PageAsset = variant({
  css: fields<{
    path: string;
  }>(),
});
export type PageAsset = VariantOf<typeof PageAsset>;
