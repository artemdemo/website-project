import React from 'react';
import { Page, PageProps, SiteRendererFn } from '@artemdemo/definitions';
import { match } from 'variant';
import { renderToStaticMarkup } from 'react-dom/server';
import { join, basename } from 'node:path';
import _isFunction from 'lodash/isFunction';
import * as mdx from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { BuildError } from '@artemdemo/error-reporter';
import { replaceExt } from '@artemdemo/fs-utils';
import { queryPagesGQL } from '../query/queryPagesGQL';
import { RawProcessData } from '../plugins/IPlugin';
import { importJS } from './importJS';

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
    page: Page,
    content: string,
    props?: PageProps,
    options?: { baseUrl?: string },
  ) {
    const evaluated = await mdx.evaluate(content, {
      ...runtime,
      ...options,
    });

    return renderToStaticMarkup(
      this._siteRender?.pageWrapper
        ? this._siteRender.pageWrapper({
            pageConfig: page.config,
            content: React.createElement(evaluated.default, props),
          })
        : React.createElement(evaluated.default, props),
    );
  }

  // ToDo: Do I still need this method to be public?
  private async _evalTS(
    page: Page,
    importedFile: any,
    props?: Record<string, unknown>,
  ) {
    if (!importedFile.default) {
      throw new BuildError(
        `Can't evaluate file that doesn't have "default" export`,
      );
    }
    const PageComponent = importedFile.default;
    return renderToStaticMarkup(
      this._siteRender?.pageWrapper
        ? this._siteRender.pageWrapper({
            pageConfig: page.config,
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
          page,
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
        const userPagePath = `${this._cwd}/${transpiledPagePath}`;
        const userPageComponent = await importJS(userPagePath);
        if (!userPageComponent.default) {
          throw new BuildError(
            `Can't evaluate page that doesn't have "default" export. See "${page.path}"`,
          );
        }
        if (userPageComponent.query) {
          if (!_isFunction(userPageComponent.query)) {
            throw new BuildError(
              `"query" should be a function. See "${page.relativePath}"`,
            );
          }
          pageProps.queriedPages = await queryPagesGQL(
            userPageComponent.query(),
          );
        }
        return this._evalTS(page, userPageComponent, {
          ...pageProps,
          ...(props || {}),
        });
      },
    });
  }
}
