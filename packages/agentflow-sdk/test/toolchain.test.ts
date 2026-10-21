import { realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const typescriptSeenBy = (tool: string) =>
  createRequire(realpathSync(require.resolve(`${tool}/package.json`)))('typescript/package.json').version as string;

describe('toolchain', () => {
  it('compiles with TypeScript 7', () => {
    expect(require('typescript/package.json').version).toMatch(/^7\./);
  });
  it('gives openapi-typescript a TypeScript that still has the JavaScript API', () => {
    expect(typescriptSeenBy('openapi-typescript')).toMatch(/^5\./);
  });
});
