import { QueryPagesFn } from 'definitions';
import { getAppContext } from './context';

export const queryPages: QueryPagesFn = () => {
  const { model } = getAppContext();

  return model?.pages ?? [];
};
