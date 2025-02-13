import { SiteRendererFn } from 'definitions';

function isSiteRenderFn(data: unknown): data is { default: SiteRendererFn } {
  return (
    data != null &&
    typeof data === 'object' &&
    'default' in data &&
    data.default != null &&
    typeof data.default === 'object' &&
    'pageWrapper' in data.default &&
    typeof data.default.pageWrapper === 'function'
  );
}

export const loadSiteRender = async (
  cwd: string,
): Promise<ReturnType<SiteRendererFn>> => {
  try {
    const result: unknown = await import(`${cwd}/target/site.render.js`);

    if (isSiteRenderFn(result)) {
      return result.default();
    }
  } catch (e) {
    // nothing
  }

  return {};
};
