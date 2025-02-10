import { createBuilders } from './builders/createBuilders';
import { createDriver } from './drivers/createDriver';

export const e2eTestkit = () => {
  return {
    driver: createDriver(),
    builders: createBuilders(),
  };
};
