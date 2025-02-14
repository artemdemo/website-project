import { describe, it } from 'vitest';
import { testkit } from './infra/testkit';

describe('Build Command', () => {
  const { driver, builders } = testkit();

  it('should', async () => {
    const { cwd } = await driver.project.setup();
    await driver.npm.install(cwd);

    console.log('>> cwd');
  });
});
