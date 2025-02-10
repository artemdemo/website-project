import { describe, it } from 'vitest';
import { e2eTestkit } from './infra/e2eTestkit';

describe('build', () => {
  const { driver, builders } = e2eTestkit();

  it('should', async () => {
    const { cwd } = await driver.project.setup();
    await driver.npm.install(cwd);
  });
});
