import React from 'react';
import { Page, PageProps, SiteRendererFn } from 'definitions';
import { match } from 'variant';
import { renderToStaticMarkup } from 'react-dom/server';
import { join, basename } from 'node:path';
import _isFunction from 'lodash/isFunction';
import * as mdx from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { BuildError } from 'error-reporter';
import { replaceExt } from 'fs-utils';
import { queryPagesGQL } from '../query/queryPagesGQL';
import { RawProcessData } from '../plugins/IPlugin';

export class EvalService {
  private _siteRender: ReturnType<SiteRendererFn> | undefined;
  private _cwd: string;

  constructor(options: {
    siteRender?: ReturnType<SiteRendererFn>;
    cwd: string;
  }) {
    this._siteRender = options.siteRender;
    this._cwd = options.cwd;
  }

  // ToDo: Do I still need this method to be public?
  async evalMd(
    content: string,
    props?: PageProps,
    options?: { baseUrl?: string },
  ) {
    const evaluated = await mdx.evaluate(content, {
      ...runtime,
      ...options,
    });

    return renderToStaticMarkup(
      this._siteRender
        ? this._siteRender.pageWrapper({
            content: React.createElement(evaluated.default, props),
          })
        : React.createElement(evaluated.default, props),
    );
  }

  // ToDo: Do I still need this method to be public?
  private async _evalTS(importedFile: any, props?: Record<string, unknown>) {
    if (!importedFile.default) {
      throw new BuildError(
        `Can't evaluate file that doesn't have "default" export`,
      );
    }
    const PageComponent = importedFile.default;
    return renderToStaticMarkup(
      this._siteRender
        ? this._siteRender.pageWrapper({
            content: React.createElement(PageComponent, props),
          })
        : React.createElement(PageComponent, props),
    );
  }

  async evalPage(
    page: Page,
    options: {
      // ToDo: This property is used only for MD, let's see how to use it for TS
      //    Read file as text and then eval?
      //    See implementation of `mdx.evaluate`, see useage of `baseUrl` there.
      rawProcessData: RawProcessData;
      targetPageDir: string;
      props?: Record<string, unknown>;
    },
  ) {
    const { rawProcessData, targetPageDir, props } = options;

    const pageProps: PageProps = {
      queriedPages: [],
    };

    return await match(page, {
      md: async () => {
        return this.evalMd(
          rawProcessData.content,
          {
            ...pageProps,
            ...(props || {}),
          },
          {
            baseUrl: `file://${this._cwd}/index`,
          },
        );
      },
      tsx: async () => {
        const transpiledPagePath = join(
          targetPageDir,
          replaceExt(basename(page.relativePath), '.js'),
        );
        const userPage = await import(`${this._cwd}/${transpiledPagePath}`);
        if (!userPage.default) {
          throw new BuildError(
            `Can't evaluate page that doesn't have "default" export. See "${page.path}"`,
          );
        }
        if (userPage.query) {
          if (!_isFunction(userPage.query)) {
            throw new BuildError(
              `"query" should be a function. See "${page.relativePath}"`,
            );
          }
          pageProps.queriedPages = await queryPagesGQL(userPage.query());
        }
        return this._evalTS(userPage, {
          ...pageProps,
          ...(props || {}),
        });
      },
    });
  }
}
