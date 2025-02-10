import { npmDriver } from './npmDriver';
import { projectDriver } from './project';

export const createDriver = () => {
  return {
    ...projectDriver(),
    ...npmDriver(),
  };
};
