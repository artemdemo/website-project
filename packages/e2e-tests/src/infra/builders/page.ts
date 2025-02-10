import { outdent } from 'outdent';
import type { PageConfig } from 'definitions';

export type PageBuild = {
  code: string;
  type: 'md' | 'tsx';
  config: PageConfig;
};

export const dashboardPage = (options: Partial<PageBuild> = {}): PageBuild => {
  const defaultOptions: PageBuild = {
    code: outdent`
      # Test Page

      Some test content.
    `,
    type: 'md',
    config: {
      title: 'Test Page',
    },
  };

  return {
    ...defaultOptions,
    ...options,
  };
};
