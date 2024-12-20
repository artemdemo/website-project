import { map } from 'nanostores';

interface Context {
  cwd: string | undefined;
}

export const $context = map<Context>({
  cwd: undefined,
});

interface InitializedContext extends Context {
  cwd: string;
}

export const getContext = (): InitializedContext => {
  const contextData = $context.get();
  const { cwd } = contextData;

  if (!cwd) {
    throw new Error('cwd should be deined before usage');
  }

  return {
    ...contextData,
    cwd,
  };
};


