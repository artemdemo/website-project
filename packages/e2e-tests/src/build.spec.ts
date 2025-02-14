import { describe, it } from 'vitest';
import { testkit } from './infra/testkit';

describe('Build Command', () => {
  const { driver } = testkit();

  it('should create minimal project', async () => {
    const { cwd } = await driver.project.setup();
    await driver.npm.install(cwd);
    console.log('>> cwd', cwd);
  });
});
