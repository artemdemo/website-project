import { z } from 'zod';

export const pageConfigSchema = z.object({
  title: z.string(),
  date: z.string().optional(),
  featuredImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
});

export type PageConfig = z.infer<typeof pageConfigSchema>;
