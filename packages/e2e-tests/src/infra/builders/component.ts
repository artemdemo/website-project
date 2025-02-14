import { outdent } from 'outdent';

export type ComponentBuild = {
  content: string;
};

export const tsxComponent = (
  options: Partial<ComponentBuild> = {},
): ComponentBuild => {
  const defaultOptions: ComponentBuild = {
    content: outdent`
      import React from 'react';

      export const Component = () => {
        return <p>Tsx Component</p>;
      };
    `,
  };

  return {
    ...defaultOptions,
    ...options,
  };
};
