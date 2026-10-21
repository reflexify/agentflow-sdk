import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

// `agentflow-app init` copies the case desk, then removes a group for `--no-ui` or `--no-site`. A file no group lists
// and the shared part does not hold would stay behind in a project that no longer has what it belongs to.

interface Group {
  files: string[];
  dependencies: string[];
  devDependencies: string[];
  scripts: string[];
  manifest?: { ui?: true; launcherEntries?: string[] };
}

const root = join(import.meta.dirname, '..');
const read = (rel: string) => JSON.parse(readFileSync(join(root, rel), 'utf8'));
const { starterOnly, ...starter }: { starterOnly: string[] } & Record<'ui' | 'site', Group> = read('starter.json');
const pkg = read('package.json');
const manifest = read('config/package-manifest.json');

const SHARED = [
  'agentflow.app.mjs', 'config/', 'package/', 'README.md', 'AGENTS.md', 'CLAUDE.md', 'package.json', 'tsconfig.json',
  'tsconfig.node.json', 'vitest.config.ts', '.gitignore',
];
/** Local and built files, which git ignores. Their names are listed here, never read. */
const LOCAL = new Set(['node_modules', 'dist', 'dist-app', 'keys', 'package/ui', '.env']);

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    const rel = relative(root, path);
    if (LOCAL.has(rel)) return [];
    return entry.isDirectory() ? walk(path) : [rel];
  });
}

/** In a checkout, the files git would keep, as `copy-starter` lists them, so a local `.DS_Store` is not one of them. */
function files(): string[] {
  try {
    const listed = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard', '.'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const out = listed.split('\0').filter((rel) => rel && existsSync(join(root, rel)));
    if (out.length > 0) return out;
  } catch {
    // not a checkout: walk the folder
  }
  return walk(root);
}

const covers = (listed: string, file: string) => (listed.endsWith('/') ? file.startsWith(listed) : file === listed);

describe('starter.json', () => {
  it('keeps out of a new project what describes the starter itself, and test/package.test.ts, which reads the SDK workspace', () => {
    expect(starterOnly).toEqual(['starter.json', 'test/starter.test.ts', 'test/package.test.ts']);
  });

  for (const [name, group] of Object.entries(starter)) {
    it(`names only what exists, in the ${name} group`, () => {
      for (const file of group.files) expect(existsSync(join(root, file)), file).toBe(true);
      for (const dep of group.dependencies) expect(pkg.dependencies, dep).toHaveProperty([dep]);
      for (const dep of group.devDependencies) expect(pkg.devDependencies, dep).toHaveProperty([dep]);
      for (const script of group.scripts) expect(pkg.scripts, script).toHaveProperty([script]);
      if (group.manifest?.ui) expect(manifest.ui).toBeDefined();
      const entries = (manifest.launcher?.entries ?? []).map((e: { key: string }) => e.key);
      for (const key of group.manifest?.launcherEntries ?? []) expect(entries).toContain(key);
    });
  }

  it.each(['README.md', 'AGENTS.md', 'RUNBOOK.md'])('fences %s in balanced blocks, each named for a group `init` knows', (doc) => {
    const known = ['ui', 'site', 'only', 'typescript', 'example'];
    let open: string | undefined;
    const used = new Set<string>();
    for (const line of readFileSync(join(root, doc), 'utf8').split('\n')) {
      const fence = /^\s*<!-- (\/)?starter:([a-z]+(?:\+[a-z]+)*) -->$/.exec(line);
      if (!fence) {
        expect(line, 'a fence comment must stand on a line of its own').not.toContain('starter:');
        continue;
      }
      const [, closing, name] = fence;
      for (const part of name.split('+')) {
        expect(known, name).toContain(part);
        used.add(part);
      }
      if (closing) {
        expect(open, `closes ${name}`).toBe(name);
        open = undefined;
      } else {
        expect(open, `opens ${name} inside another block`).toBeUndefined();
        open = name;
      }
    }
    expect(open, 'a block is never closed').toBeUndefined();
    if (doc === 'README.md') expect(used.has('only'), 'the README says what the starter itself is, in a starter:only block').toBe(true);
  });

  it('classifies every file of the case desk exactly once', () => {
    const lists = { ...starter, shared: { files: SHARED }, starter: { files: starterOnly } };
    const unclassified: string[] = [];
    const twice: string[] = [];
    for (const file of files()) {
      const owners = Object.entries(lists).filter(([, g]) => g.files.some((listed) => covers(listed, file)));
      if (owners.length === 0) unclassified.push(file);
      if (owners.length > 1) twice.push(`${file}: ${owners.map(([n]) => n).join(', ')}`);
    }
    expect(unclassified, 'add each to a group of starter.json, or to the shared part').toEqual([]);
    expect(twice).toEqual([]);
  });
});
