import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

it('has the scripts a developer and CI run', () => {
  for (const script of ['dev', 'build', 'typecheck', 'test', 'e2e']) expect(pkg.scripts, script).toHaveProperty(script);
});

it('runs Plan 3\'s config tests with its own, so the workspace test run covers them', () => {
  expect(pkg.scripts.test).toContain('config/code/test/*.test.js');
  expect(pkg.scripts.test).toContain('config/build/build.test.mjs');
});

it('admits no Node older than 22.12, the floor Vite 8 and Vitest 5 impose', () => {
  expect(pkg.engines.node).toMatch(/^>=22\.\d+\.\d+$/);
  expect(Number(pkg.engines.node.split('.')[1])).toBeGreaterThanOrEqual(12);
});

it('lets the scripts that read .env run without one, so their own messages name what is missing', () => {
  expect(pkg.scripts.start).toContain('--env-file-if-exists');
  expect(pkg.scripts['check-setup']).toBe('tsx --env-file-if-exists=.env scripts/doctor.ts');
  expect(pkg.scripts).not.toHaveProperty('subscribe');
  expect(pkg.dependencies).not.toHaveProperty('ws');
});

it('builds the desk as an app module for a package\'s ui/, and checks that build with a script of its own', () => {
  expect(pkg.scripts['build:ui']).toBe('vite build --config vite.module.config.ts');
  expect(pkg.scripts['test:ui']).toBe('tsx scripts/check-ui-build.ts');
});

it('writes the module build to a directory of its own, which the page build (it empties dist/) never reaches, and git ignores', () => {
  const module = readFileSync(new URL('../vite.module.config.ts', import.meta.url), 'utf8');
  const ignored = readFileSync(new URL('../.gitignore', import.meta.url), 'utf8').split('\n');
  expect(module).toContain("outDir: 'ui-dist'");
  expect(ignored).toContain('ui-dist/');
  expect(ignored).toContain('dist/');
});

it('builds and seals the package with the app builder, checks the build it seals from, and git ignores the archives and the built ui/', () => {
  const ignored = readFileSync(new URL('../.gitignore', import.meta.url), 'utf8').split('\n');
  expect(pkg.scripts['pack:app']).toBe('agentflow-app build && agentflow-app seal');
  expect(pkg.scripts['test:pack']).toBe('tsx scripts/check-pack.ts');
  expect(ignored).toContain('dist-app/');
  expect(ignored).toContain('/package/ui/');
});
