import type {
  PagesFn,
  QueryPageResult,
  TagsFn,
} from '@artemdemo/definitions/graphql';
import _intersection from 'lodash/intersection';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getAppContext } from '../services/context';
import { EvalService } from '../services/EvalService';

export class RootGraphql {
  tags: TagsFn = async () => {
    const { model } = getAppContext();
    const tagNames = new Set<string>();

    for (const page of model.pages) {
      const tags = page.config.tags || [];

      tags.forEach((tagName) => tagNames.add(tagName));
    }

    return Array.from(tagNames).map((name) => ({ name }));
  };

  pages: PagesFn = async ({ limit, filter }) => {
    const { cwd, model } = getAppContext();
    const result: QueryPageResult[] = [];

    const evalService = new EvalService({ cwd });

    for (const page of model.pages) {
      if (Array.isArray(filter.categories) && filter.categories.length > 0) {
        if (
          Array.isArray(page.config.categories) &&
          _intersection(page.config.categories, filter.categories)
        ) {
          const pageData: QueryPageResult = {
            route: page.route,
            thumbnail: page.thumbnailPath,
            config: page.config,
          };
          if (page.excerptPath) {
            // ToDo: This read from the disc will happen on every query.
            //  Not that performant. Maybe cache it?
            const excerptContent = await readFile(join(cwd, page.excerptPath), {
              encoding: 'utf8',
            });
            pageData.excerpt = await evalService.evalMd(page, excerptContent);
          }
          result.push(pageData);
          if (limit !== 0 && result.length >= limit) {
            break;
          }
        }
      }
    }

    result.sort((pageA, pageB) => {
      return pageA.route.localeCompare(pageB.route);
    });

    return result;
  };
}
