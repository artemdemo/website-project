import { graphql } from 'graphql';
import type { PageFields } from 'definitions';
import { schema } from 'definitions/graphql';
import { RootGraphql } from './RootGraphql';

export const queryPages = async (source: string) => {
  const result = await graphql({
    schema,
    source,
    rootValue: new RootGraphql(),
  });

  console.log(result);

  return (result.data?.pages as PageFields[]) ?? [];
};
