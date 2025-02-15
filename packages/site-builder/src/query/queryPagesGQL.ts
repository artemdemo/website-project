import { graphql } from 'graphql';
import type { PageFields, QuerySiteDataFn } from '@artemdemo/definitions';
import { QueryTagResult, schema } from '@artemdemo/definitions/graphql';
import { RootGraphql } from './RootGraphql';

export const queryPagesGQL: QuerySiteDataFn = async (source) => {
  const result = await graphql({
    schema,
    source,
    rootValue: new RootGraphql(),
  });

  if (result.errors) {
    for (const err of result.errors) {
      console.log(err.stack);
      console.log(err.locations);
      console.log('Source:');
      console.log(source);
    }
  }

  return {
    pages: (result.data?.pages as Partial<PageFields>[]) ?? [],
    tags: (result.data?.tags as Partial<QueryTagResult>[]) ?? [],
  };
};
