import { BuildError } from '@artemdemo/error-reporter';
import { build } from './commands/build.js';
import { preview } from './commands/preview.js';

const commands: { [key: string]: (args: string[]) => void } = {
  build: () => {
    build();
  },
  preview: () => {
    preview();
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
