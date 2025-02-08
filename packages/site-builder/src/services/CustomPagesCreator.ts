import { join, sep } from 'node:path';
import { CreatePageOptions } from 'definitions';
import { BuildError } from 'error-reporter';
import tsup from 'tsup';
import { TARGET_PAGES_DIR } from '../constants';

export class CustomPagesCreator {
  private _queue: {
    templatePath: string;
    targetPath: string;
    route: string;
    props?: Record<string, unknown>;
  }[] = [];

  queuePage({ templatePath, route, props }: CreatePageOptions) {
    const templateFileNameExt = (templatePath.split(sep).at(-1) || templatePath)
      .split('.')
      .at(-1);
    if (templateFileNameExt !== 'tsx') {
      throw new BuildError(
        `Template file could have only 'tsx' extension. Given "${templateFileNameExt}", see in "${templatePath}"`,
      );
    }

    if (this._queue.some((item) => item.route === route)) {
      throw new BuildError(`Route already in use. Given "${route}"`);
    }

    const targetPath = join(
      TARGET_PAGES_DIR,
      route.split('/').join(sep),
      'index',
    );

    this._queue.push({
      templatePath,
      targetPath,
      route,
      props,
    });
  }

  async renderPagesToTarget() {
    await tsup.build({
      entry: this._queue.reduce<Record<string, string>>((acc, item) => {
        acc[item.targetPath] = item.templatePath;
        return acc;
      }, {}),
      format: ['esm'],
      outDir: '.',
      external: ['react', 'react-dom'],
    });
  }

  async evalPages() {}
}
