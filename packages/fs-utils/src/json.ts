import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { EOL } from 'node:os';
import { dirname, join } from 'node:path';
import { PackageJson, packageJsonSchema } from './schemas';

const toJsonString = (data: unknown, opts?: { spaces: number }): string => {
  return JSON.stringify(data, null, opts?.spaces).concat(EOL);
}

export const writeJson = async (
  filePath: string,
  data: unknown,
  opts?: { spaces: number }
) => {
  const strJson = toJsonString(data, opts);
  await mkdir(dirname(filePath));

  await writeFile(filePath, strJson, 'utf-8');
};

export const readJson = async (filePath: string) => {
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content);
};

export const writePkgJson = async (projectFolder: string, pkgJson: PackageJson) => {
  const pkgJsonPath = join(projectFolder, 'package.json');

  await writeJson(pkgJsonPath, pkgJson, { spaces: 2 });
}

export const readPkgJson = async (projectFolder: string) => {
  const pkgJsonPath = join(projectFolder, 'package.json');
  const json = await readJson(pkgJsonPath);
  await packageJsonSchema.parseAsync(json);

  // `zod` is changing order of keys,
  // returning original `json` after validation
  return json;
}
