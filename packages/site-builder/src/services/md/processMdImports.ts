import { Page, PageAsset } from 'definitions';
import { MdImport } from './mdTypes';

export const processMdImports = (
  page: Page,
  imports: MdImport[],
  fullPostContent: string,
) => {
  const pageAssets: Array<PageAsset> = [];

  for (const importItem of imports) {
    if (importItem.mdFilePath == page.path) {
      fullPostContent = fullPostContent.replace(
        importItem.importPath,
        `./${importItem.targetImportPath}`,
      );
      if (importItem.cssPath) {
        pageAssets.push(
          PageAsset.css({
            path: importItem.cssPath,
          }),
        );
      }
    }
  }

  return {
    fullPostContent,
    pageAssets,
  };
};
