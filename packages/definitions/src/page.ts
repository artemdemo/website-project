import { z } from 'zod';

export const pageConfigSchema = z.object({
  title: z.string(),
  date: z.string(),
  featuredImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type PageConfig = z.infer<typeof pageConfigSchema>;

export interface Page {
  path: string;
  relativePath: string;
  config: PageConfig;
}
