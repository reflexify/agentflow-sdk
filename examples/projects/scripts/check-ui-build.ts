// Builds the module's ui/ as `pnpm build:ui` does, into a temporary directory, and checks it from the files it
// writes. It never imports the built file. Run with `pnpm --filter projects test:ui`.
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

/** Rolldown's export list for an ES entry whose only export is `mount`: `export { mount };` or `export { x as mount };`. */
const MOUNT_EXPORT = /export\s*\{\s*(?:[\w$]+\s+as\s+)?mount\s*\}\s*;?\s*$/;
/** An import of React or the kit by name: the module must bring its own copy, bundled. */
const REACT_IMPORT = /\b(?:from|import)\s*["'](react|react-dom|@reflexify\/agentflow-elements)(\/[\w-]+)?["']/;

// As `vite build` has it in a clean shell; a shell that exports another value would change React's JSX runtime.
process.env.NODE_ENV = 'production';
const app = fileURLToPath(new URL('..', import.meta.url));
const out = await mkdtemp(join(tmpdir(), 'projects-ui-'));
try {
  await build({ root: app, configFile: join(app, 'vite.module.config.ts'), logLevel: 'warn', build: { outDir: out } });
  const files = (await readdir(out, { recursive: true })).map(String).sort();
  assert.ok(files.includes('index.js'), `no index.js among ${files.join(', ')}`);
  assert.deepEqual(files.filter((f) => f.endsWith('.css')), [], 'a stylesheet was written beside the script');
  const entry = await readFile(join(out, 'index.js'), 'utf8');
  assert.match(entry, MOUNT_EXPORT, `index.js does not end by exporting mount; it ends:\n${entry.slice(-300)}`);
  for (const file of files.filter((f) => f.endsWith('.js'))) {
    const text = await readFile(join(out, file), 'utf8');
    assert.ok(!text.includes('process.env.NODE_ENV'), `${file} still reads process.env.NODE_ENV`);
    assert.doesNotMatch(text, REACT_IMPORT, `${file} imports React or the kit instead of bundling it`);
  }
  console.log(`ui/ build checked: ${files.join(', ')}`);
} finally {
  await rm(out, { recursive: true, force: true });
}
