import { z } from 'zod';

export const pageConfigSchema = z.object({
  title: z.string(),
  date: z.string(),
  featuredImage: z.string(),
  tags: z.array(z.string()),
});

export type PageConfig = z.infer<typeof pageConfigSchema>;

export interface Page {
  path: string;
  relativePath: string;
  config: PageConfig;
}
