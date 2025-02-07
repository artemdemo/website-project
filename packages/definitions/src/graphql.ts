import { buildSchema } from 'graphql';
import { PageConfig } from './page-config';

/**
 * Schema filter suggestions: https://dgraph.io/docs/v21.03/graphql/schema/search/
 *
 */

export interface QueryPageResult {
  route: string;
  excerpt?: string;
  config: PageConfig;
}

type PageFilterInput = {
  tags?: string[];
  categories?: string[];
};

export type PagesFn = (props: {
  limit: number;
  filter: PageFilterInput;
}) => Promise<QueryPageResult[]>;

/**
 * There is a specific type in GraphQL for ids - `ID`.
 * The issue with it is that it makes it `string` in the end, which will fuck up all my current calculations.
 * This is because all other endpoint return ids as integer, so I no longer will be able to compare them.
 */

export const schema = buildSchema(`
  type Query {
    pages(limit: Int, filter: PageFilterInput): [Page]!
  }
  input PageFilterInput {
    tags: [String!]
    categories: [String!]
  }

  type Page {
    route: String!
    excerpt: String
    config: PageConfig!
  }
  type PageConfig {
    title: String!
    date: String
    tags: [String]
    categories: [String]
  }
`);
