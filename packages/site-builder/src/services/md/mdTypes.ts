export type MdImport = {
  importPath: string;
  targetImportPath: string;
  cssPath?: string;
  statement: string;
  positionIdx: number;
  mdFilePath: string;
};
