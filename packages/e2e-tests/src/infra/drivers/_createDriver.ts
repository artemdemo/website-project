import { npmDriver } from './npm';
import { projectDriver } from './project';

export const createDriver = () => {
  return {
    ...npmDriver(),
    ...projectDriver(),
  };
};
