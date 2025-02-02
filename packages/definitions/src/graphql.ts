import { buildSchema } from 'graphql';

/**
 * Schema filter suggestions: https://dgraph.io/docs/v21.03/graphql/schema/search/
 *
 */

// type ExactQueryOperatorInput = {
//   lt?: number;
//   le?: number;
//   eq?: number;
//   in?: number;
//   between?: { min: number; max: number };
//   ge?: number;
//   gt?: number;
// };

// type TermQueryOperatorInput = {
//   allofterms?: string;
//   anyofterms?: string;
// };

type FulltextQueryOperatorInput = {
  alloftext?: string;
  anyoftext?: string;
};

export type Limit = number;

export type PageFilterInput = {
  comment?: FulltextQueryOperatorInput;
};

/**
 * There is a specific type in GraphQL for ids - `ID`.
 * The issue with it is that it makes it `string` in the end, which will fuck up all my current calculations.
 * This is because all other endpoint return ids as integer, so I no longer will be able to compare them.
 */

export const schema = buildSchema(`
  type Query {
    pages(limit: Int, filter: PageFilterInput): [Page]
  }
  input PageFilterInput {
    tags: [String!]
  }

  type Page {
    route: String!
    path: String!
    relativePath: String!
    config: PageConfig!
  }
  type PageConfig {
    title: String!
    date: String
    tags: [String]
    categories: [String]
  }
`);
