import type { PagesFn } from 'definitions/graphql';
import { getAppContext } from '../services/context';

export class RootGraphql {
  pages: PagesFn = ({ limit, filter }) => {
    const { model } = getAppContext();
    console.log('RootGraphql', limit, filter);
    return [];
  };
}
