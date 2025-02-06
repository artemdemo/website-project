import { BuildError } from 'error-reporter';
import { build } from './commands/build.js';

const commands: { [key: string]: (args: string[]) => void } = {
  build: () => {
    build();
  },
};

const commandKeys = Object.keys(commands);

const args: string[] = [];
let commandKey: string = '';

process.argv.forEach((arg) => {
  if (commandKey !== '') {
    args.push(arg);
  }
  if (commandKeys.includes(arg)) {
    commandKey = arg;
  }
});

if (!commands[commandKey]) {
  throw new BuildError(`Unknown command: ${commandKey}`);
}

commands[commandKey](args);
