import { outdent } from 'outdent';
import type { PageConfig } from '@artemdemo/definitions';

export type PageBuild = {
  content: string;
  type: 'md' | 'tsx';
  config: PageConfig;
};

export const dashboardPage = (options: Partial<PageBuild> = {}): PageBuild => {
  const defaultOptions: PageBuild = {
    content: outdent`
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
