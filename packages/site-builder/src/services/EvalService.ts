import React from 'react';
import { Page, PageProps, SiteRendererFn } from 'definitions';
import { match } from 'variant';
import { renderToStaticMarkup } from 'react-dom/server';
import { join, basename } from 'node:path';
import _isFunction from 'lodash/isFunction';
import * as mdx from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { BuildError } from 'error-reporter';
import { queryPages } from '../query/queryPages';
import { RawProcessData } from '../plugins/IPlugin';
import { replaceExt } from './fs';

export class EvalService {
  private _siteRender: ReturnType<SiteRendererFn>;
  private _cwd: string;

  constructor(options: {
    siteRender: ReturnType<SiteRendererFn>;
    cwd: string;
  }) {
    this._siteRender = options.siteRender;
    this._cwd = options.cwd;
  }

  async evaluate(options: {
    page: Page;
    rawProcessData: RawProcessData;
    targetPageDir: string;
    processQueries?: boolean;
  }) {
    const {
      page,
      rawProcessData,
      targetPageDir,
      processQueries = false,
    } = options;

    const pageProps: PageProps = {
      queriedPages: [],
    };

    return await match(page, {
      md: async () => {
        const evaluated = await mdx.evaluate(rawProcessData.content, {
          ...runtime,
          baseUrl: `file://${this._cwd}/index`,
        });

        return renderToStaticMarkup(
          this._siteRender.pageRender({
            content: React.createElement(evaluated.default, pageProps),
          }),
        );
      },
      tsx: async () => {
        const transpiledPagePath = join(
          targetPageDir,
          replaceExt(basename(page.relativePath), '.js'),
        );
        const userPage = await import(`${this._cwd}/${transpiledPagePath}`);
        const PageComponent = userPage.default;
        if (processQueries && userPage.query) {
          if (!_isFunction(userPage.query)) {
            throw new BuildError(
              `"query" should be a function. See "${page.relativePath}"`,
            );
          }
          pageProps.queriedPages = await queryPages(userPage.query());
        }
        return renderToStaticMarkup(
          this._siteRender.pageRender({
            content: React.createElement(PageComponent, pageProps),
          }),
        );
      },
    });
  }
}
