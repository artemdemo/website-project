import { graphql } from 'graphql';
import type { PageFields } from 'definitions';
import { schema } from 'definitions/graphql';
import { RootGraphql } from './RootGraphql';

export const queryPages = async (source: string): Promise<Partial<PageFields>[]> => {
  const result = await graphql({
    schema,
    source,
    rootValue: new RootGraphql(),
  });

  if (result.errors) {
    for (const err of result.errors) {
      console.log(err.stack);
      console.log(err.locations);
    }
  }

  return (result.data?.pages as Partial<PageFields>[]) ?? [];
};
