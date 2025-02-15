import { graphql } from 'graphql';
import type { PageFields } from '@artemdemo/definitions';
import { schema } from '@artemdemo/definitions/graphql';
import { RootGraphql } from './RootGraphql';

export const queryPagesGQL = async (
  source: string,
): Promise<Partial<PageFields>[]> => {
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
