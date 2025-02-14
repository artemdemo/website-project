import { z } from 'zod';

export const siteConfigSchema = z.object({
  titlePrefix: z.string(),
  metaDescription: z.string(),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;
