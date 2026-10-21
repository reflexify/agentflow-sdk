import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Copies the case desk into dist/starter/, which `agentflow-app init` reads. The SDK mirror has no git history of the
// monorepo, so there the committed dist/starter/ is left as it is.

const here = path.dirname(fileURLToPath(import.meta.url));
const STARTER = 'sdk/examples/case-desk';

let top;
try {
  top = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: here, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
} catch {
  top = undefined;
}
const source = top && path.join(top, STARTER);
if (!source || !fs.existsSync(path.join(source, 'starter.json'))) process.exit(0);

// Cached and untracked-but-not-ignored files: a new starter file counts before it is committed, and a file git
// ignores (keys, node_modules, package/ui) never does.
const listed = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard', STARTER], {
  cwd: top,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});
const all = [...new Set(listed.split('\0').filter(Boolean).map((file) => file.slice(STARTER.length + 1)))]
  .filter((rel) => fs.existsSync(path.join(source, rel)) && rel !== 'package/ui' && !rel.startsWith('package/ui/'))
  .sort();

const { starterOnly } = JSON.parse(fs.readFileSync(path.join(source, 'starter.json'), 'utf8'));
const files = all.filter((rel) => !starterOnly.includes(rel));

// A leading dot becomes `_`, so a package manager that drops dotfiles from a tarball keeps them.
const stored = (rel) => rel.split('/').map((segment) => (segment.startsWith('.') ? `_${segment.slice(1)}` : segment)).join('/');

const out = path.join(here, '..', 'dist', 'starter');
fs.rmSync(out, { recursive: true, force: true });
for (const rel of [...files, 'starter.json']) {
  const target = path.join(out, stored(rel));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(source, rel), target);
}
fs.copyFileSync(path.join(top, 'sdk/tsconfig.base.json'), path.join(out, 'tsconfig.base.json'));
fs.writeFileSync(path.join(out, '.files.json'), `${JSON.stringify(files, null, 2)}\n`);
