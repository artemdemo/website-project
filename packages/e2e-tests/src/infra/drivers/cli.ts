// import { execa } from 'execa';

export const cliDriver = () => {
  return {
    npm: {
      execute,
    },
  };
};

const execute = (_args: string[], _options: {}) => {};
