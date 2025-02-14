import { createBuilders } from './builders/_createBuilders';
import { createDriver } from './drivers/_createDriver';

export const testkit = () => {
  return {
    driver: createDriver(),
    builders: createBuilders(),
  };
};
