import { z } from 'zod';

export const packageJsonSchema = z.object({
  dependencies: z.record(z.string()).optional(),
  devDependencies: z.record(z.string()).optional(),
});

export type PackageJson = z.infer<typeof packageJsonSchema>;
