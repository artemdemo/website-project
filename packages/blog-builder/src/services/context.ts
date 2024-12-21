import process from 'node:process';
import { map } from 'nanostores';
import { loadModel, Model } from './model/loadModel';

interface AppContext {
  cwd: string;
  model: Model | undefined;
}

const $context = map<AppContext>({
  cwd: process.cwd(),
  model: undefined,
});

export const createAppContext = async () => {
  const cwd = process.cwd();
  $context.setKey('cwd', cwd);
  $context.setKey('model', await loadModel(cwd));
};

interface InitializedAppContext extends AppContext {
  model: Model;
}

export const getAppContext = (): InitializedAppContext => {
  const context = $context.get();
  const { model } = context;

  if (!model) {
    throw new Error('`model` needs to be initialized before consumption');
  }

  return {
    ...context,
    model,
  };
};
