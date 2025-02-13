import { cliDriver } from './cliDriver';
import { npmDriver } from './npmDriver';
import { projectDriver } from './project';

export const createDriver = () => {
  return {
    ...cliDriver(),
    ...npmDriver(),
    ...projectDriver(),
  };
};
