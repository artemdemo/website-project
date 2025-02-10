import { projectsDriver } from './projects';

export const createDriver = () => {
  return {
    ...projectsDriver(),
  };
};
