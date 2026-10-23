import { readdir, readFile } from 'node:fs/promises';
import { builtinModules } from 'node:module';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const PACKAGE_DIR = fileURLToPath(new URL('..', import.meta.url));
const SRC_DIR = join(PACKAGE_DIR, 'src');

async function sourceFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return sourceFiles(path);
      return Promise.resolve(entry.name.endsWith('.ts') ? [path] : []);
    }),
  );
  return nested.flat();
}

/** Every module specifier in static imports, re-exports and dynamic `import()`s. */
function importSpecifiers(source: string): string[] {
  const specifiers: string[] = [];
  for (const match of source.matchAll(/\b(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)) specifiers.push(match[1]!);
  return specifiers;
}

/** What Node's resolver (and the bundlers that follow it) picks from a conditional export: the
 * first key, in object order, that is among the active conditions or is `default`. */
function resolveExport(target: Record<string, string>, conditions: string[]): string | undefined {
  for (const [condition, path] of Object.entries(target)) {
    if (condition === 'default' || conditions.includes(condition)) return path;
  }
  return undefined;
}

describe('runtime portability', () => {
  // The server entry is promised to mount unchanged in Bun, Deno, Workers and edge runtimes, which
  // offer Web APIs but not Node's globals or builtins.
  it('no file under src/ outside src/testing/ uses Buffer or imports a Node builtin', async () => {
    const offences: string[] = [];
    for (const file of await sourceFiles(SRC_DIR)) {
      if (relative(SRC_DIR, file).startsWith(`testing${sep}`)) continue;
      const source = await readFile(file, 'utf8');
      const name = relative(PACKAGE_DIR, file);
      if (/\bBuffer\b/.test(source)) offences.push(`${name}: Buffer`);
      for (const specifier of importSpecifiers(source)) {
        if (specifier.startsWith('node:') || builtinModules.includes(specifier)) offences.push(`${name}: ${specifier}`);
      }
    }
    expect(offences).toEqual([]);
  });

  it('nothing outside src/testing/ imports from it', async () => {
    const offences: string[] = [];
    for (const file of await sourceFiles(SRC_DIR)) {
      if (relative(SRC_DIR, file).startsWith(`testing${sep}`)) continue;
      const source = await readFile(file, 'utf8');
      for (const specifier of importSpecifiers(source)) {
        if (/(^|\/)testing(\/|$)/.test(specifier)) offences.push(`${relative(PACKAGE_DIR, file)}: ${specifier}`);
      }
    }
    expect(offences).toEqual([]);
  });

  it('the testing entry offers types and import only, so a browser or worker bundle reaches the Node builtin and fails', async () => {
    const pkg = JSON.parse(await readFile(join(PACKAGE_DIR, 'package.json'), 'utf8')) as {
      exports: Record<string, Record<string, string>>;
    };
    expect(pkg.exports['./testing']).toEqual({
      types: './dist/testing/index.d.ts',
      import: './dist/testing/index.js',
    });
  });

  it('the server entry resolves to the real module for Workers and edge bundlers, and throws only in a browser', async () => {
    const pkg = JSON.parse(await readFile(join(PACKAGE_DIR, 'package.json'), 'utf8')) as {
      exports: Record<string, Record<string, string>>;
    };
    const server = pkg.exports['./server']!;
    const SERVER = './dist/server/index.js';

    expect(Object.keys(server)[0]).toBe('types');
    // Condition sets as each toolchain passes them; each also has `browser` active, which must lose.
    expect(resolveExport(server, ['workerd', 'worker', 'browser', 'import'])).toBe(SERVER); // wrangler
    expect(resolveExport(server, ['worker', 'browser', 'import'])).toBe(SERVER); // generic worker targets
    expect(resolveExport(server, ['edge-light', 'browser', 'import'])).toBe(SERVER); // Next.js edge, Vercel
    expect(resolveExport(server, ['node', 'import'])).toBe(SERVER);
    expect(resolveExport(server, ['deno', 'import'])).toBe(SERVER);
    expect(resolveExport(server, ['bun', 'import'])).toBe(SERVER);
    expect(resolveExport(server, ['browser', 'import'])).toBe('./dist/server/refuse-browser.js');
  });
});
