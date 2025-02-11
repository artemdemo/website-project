import { describe, it } from 'vitest';
import { testkit } from './infra/testkit';

describe('build', () => {
  const { driver, builders } = testkit();

  it('should', async () => {
    const { cwd } = await driver.project.setup();
    await driver.npm.install(cwd);
  });
});
