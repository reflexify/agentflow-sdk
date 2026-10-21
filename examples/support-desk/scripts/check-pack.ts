// Builds the app in a temporary copy of it, as `pnpm pack:app` does, checks what the build writes, and signs it
// with a key made for the check. Run with `pnpm --filter support-desk test:pack`.
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildApp, keygen, MOUNT_EXPORT, readKeyFile, readPayloadDir, sign, UI_EXTENSIONS } from '@reflexify/agentflow-app-builder';

const files = (dir: string) => readdirSync(dir, { recursive: true, withFileTypes: true }).filter((e) => e.isFile()).map((e) => join(e.parentPath, e.name).slice(dir.length + 1)).sort();

const app = fileURLToPath(new URL('..', import.meta.url));
const { version } = JSON.parse(readFileSync(join(app, 'config/package-manifest.json'), 'utf8')) as { version: string };
const work = mkdtempSync(join(tmpdir(), 'support-desk-pack-'));
try {
  const copy = join(work, 'examples', 'support-desk');
  cpSync(join(app, '../../tsconfig.base.json'), join(work, 'tsconfig.base.json'));
  for (const entry of readdirSync(app)) {
    if (entry === 'node_modules' || entry === 'package') continue;
    if (['agentflow.app.mjs', 'config', 'src', 'shared', 'package.json'].includes(entry) || /^(vite\..*\.ts|tsconfig.*\.json)$/.test(entry)) cpSync(join(app, entry), join(copy, entry), { recursive: true });
  }
  cpSync(join(app, 'package'), join(copy, 'package'), { recursive: true, filter: (src) => !src.includes('/package/ui') });
  symlinkSync(join(app, 'node_modules'), join(copy, 'node_modules'));

  const built = await buildApp(copy);
  assert.equal(built.ui, 'built');
  const payload = join(copy, 'package');
  assert.deepEqual(readdirSync(payload).sort(), ['manifest.json', 'objects', 'ui'], 'package/ holds more or less than manifest.json, objects and ui');

  const ui = files(join(payload, 'ui')).map((f) => `ui/${f}`);
  assert.ok(ui.includes('ui/index.js'), `no ui/index.js among ${ui.join(', ')}`);
  const entry = readFileSync(join(payload, 'ui/index.js'), 'utf8');
  assert.match(entry, MOUNT_EXPORT, `ui/index.js does not end by exporting mount; it ends:\n${entry.slice(-300)}`);
  assert.deepEqual(ui.filter((f) => !UI_EXTENSIONS.has(extname(f))), [], 'ui/ holds files the verifier refuses');

  const keyFile = join(work, 'keys', 'dev-rfx.pem');
  keygen('dev-rfx', keyFile);
  const sealed = sign(readPayloadDir(payload), readKeyFile(keyFile, 'dev-rfx'));
  assert.equal(sealed.fileName, `rfx-support-desk-${version}.afpkg`);

  console.log(`built ${files(payload).length} payload files, ${ui.length} ui files (${ui.join(', ')}); signed ${sealed.fileName}`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
