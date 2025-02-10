import { projectDriver } from './projects';

export const createDriver = () => {
  return {
    ...projectDriver(),
  };
};
