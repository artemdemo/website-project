import { z } from 'zod';

export const postConfigSchema = z.object({
  title: z.string(),
  date: z.string(),
  featuredImage: z.string(),
  tags: z.array(z.string()),
});

export type PostConfig = z.infer<typeof postConfigSchema>;

export interface Post {
  path: string;
  relativePath: string;
  config: PostConfig;
}
