import { cliDriver } from './cli';
import { npmDriver } from './npm';
import { projectDriver } from './project';

export const createDriver = () => {
  return {
    ...cliDriver(),
    ...npmDriver(),
    ...projectDriver(),
  };
};
