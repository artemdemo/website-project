import type { PagesFn } from 'definitions/graphql';
import _intersection from 'lodash/intersection';
import { PageFields } from 'definitions';
import { getAppContext } from '../services/context';

export class RootGraphql {
  pages: PagesFn = ({ limit, filter }) => {
    const { model } = getAppContext();
    const result: PageFields[] = [];

    for (const page of model.pages) {
      if (Array.isArray(filter.categories) && filter.categories.length > 0) {
        if (
          Array.isArray(page.config.categories) &&
          _intersection(page.config.categories, filter.categories)
        ) {
          result.push(page);
          if (result.length >= limit - 1) {
            break;
          }
        }
      }
    }
    return result;
  };
}
