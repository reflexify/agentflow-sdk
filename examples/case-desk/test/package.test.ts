import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const workspace = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'));

it('admits no Node older than 22.9, the first with the --env-file-if-exists that start uses', () => {
  expect(pkg.scripts.start).toContain('--env-file-if-exists');
  expect(pkg.engines.node).toMatch(/^>=22\.\d+\.\d+$/);
  expect(Number(pkg.engines.node.split('.')[1])).toBeGreaterThanOrEqual(9);
});

it('asks the SDK workspace for the same Node and pnpm as Case desk, since the runbook installs from there', () => {
  expect(workspace.engines.node).toBe(pkg.engines.node);
  expect(pkg.packageManager).toBe(workspace.packageManager);
});

it('lets check-setup run without a .env, so its configuration check names what is missing', () => {
  expect(pkg.scripts['check-setup']).toBe('tsx --env-file-if-exists=.env scripts/doctor.ts');
});
