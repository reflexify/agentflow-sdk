import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ELEMENTS_VERSION, defineAgentFlowElements } from '../src/index.js';
import { KIT_VERSION } from '../src/kit/version.js';
import pkg from '../package.json';

// A bare specifier is one that starts with neither `.` nor `/`.
const BARE_IMPORTS = [
  /^\s*(?:import|export)\b[^;'"]*\bfrom\s*['"](?![./])/m,
  /^\s*import\s*['"](?![./])/m,
  /\bimport\(\s*['"](?![./])/,
];
const KIT_BYTES_MAX = 520_000;
const hasBareImport = (code: string) => BARE_IMPORTS.some((re) => re.test(code));
const TAGS = ['agentflow-provider', 'agentflow-task-inbox', 'agentflow-task-detail', 'agentflow-record-table', 'agentflow-start-form'];

afterEach(() => vi.restoreAllMocks());

describe('registration and the bundle', () => {
  it('registering twice is a no-op, and silent', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const before = customElements.get('agentflow-provider');
    expect(() => defineAgentFlowElements()).not.toThrow();
    expect(customElements.get('agentflow-provider')).toBe(before);
    for (const tag of TAGS) expect(customElements.get(tag), tag).toBeDefined();
    expect(warn).not.toHaveBeenCalled();
  });
  it('stamps the package version on every element class', () => {
    expect(ELEMENTS_VERSION).toBe(pkg.version);
    expect(KIT_VERSION).toBe(ELEMENTS_VERSION);
    for (const tag of TAGS) expect((customElements.get(tag) as unknown as { elementsVersion: string }).elementsVersion, tag).toBe(ELEMENTS_VERSION);
  });
  it('warns once for each tag an older or unversioned copy registered first, and stays quiet for its own or a newer one', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const older = Object.assign(class extends HTMLElement {}, { elementsVersion: '0.0.9' });
    const unversioned = class extends HTMLElement {};
    const newer = Object.assign(class extends HTMLElement {}, { elementsVersion: '99.0.0' });
    const theirs: Record<string, CustomElementConstructor> = { 'agentflow-provider': older, 'agentflow-task-inbox': unversioned, 'agentflow-task-detail': newer };
    const registry = { get: (tag: string) => theirs[tag] ?? customElements.get(tag), define: () => {} } as unknown as CustomElementRegistry;
    defineAgentFlowElements(registry);
    expect(warn.mock.calls.map((c) => (c[1] as { tag: string }).tag)).toEqual(['agentflow-provider', 'agentflow-task-inbox']);
    expect(warn.mock.calls[0]![0]).toBe('An older copy of the AgentFlow elements registered agentflow-provider first; this page uses it, not this copy.');
    expect(warn.mock.calls[0]![1]).toEqual({ tag: 'agentflow-provider', registered: '0.0.9', loaded: ELEMENTS_VERSION });
    expect(warn.mock.calls[1]![1]).toEqual({ tag: 'agentflow-task-inbox', registered: null, loaded: ELEMENTS_VERSION });
  });
  it('recognises every form of bare import', () => {
    for (const code of ['import x from "x";', "import { y } from 'x';", 'import "x";', "import'x';", 'export { y } from "x";', 'export * from "x";', 'import("x")']) {
      expect(hasBareImport(code), code).toBe(true);
    }
    for (const code of ['import x from "./x.js";', 'import "../x.js";', 'export * from "./x.js";', 'import("./x.js")', 'export { y };']) {
      expect(hasBareImport(code), code).toBe(false);
    }
  });
  // Not `new URL('…', import.meta.url)`: Vite rewrites that into an asset URL on its dev server.
  const bundle = resolve(dirname(fileURLToPath(import.meta.url)), '../dist/agentflow-elements.js');
  it.skipIf(!existsSync(bundle))('the built bundle has no bare imports, so a plain page can load it', () => {
    const code = readFileSync(bundle, 'utf8');
    expect(hasBareImport(code)).toBe(false);
    expect(code).toContain('agentflow-task-inbox');
  });

  const kitBundle = resolve(dirname(fileURLToPath(import.meta.url)), '../dist/kit.js');
  it.skipIf(!existsSync(kitBundle))('the kit bundle has no bare imports and registers only kit tags', () => {
    const code = readFileSync(kitBundle, 'utf8');
    expect(hasBareImport(code)).toBe(false);
    expect(code).toContain('af-person-picker');
    expect(code).not.toContain('agentflow-task-inbox');
  });
  it.skipIf(!existsSync(kitBundle))('the kit loads the editor as a chunk of its own', () => {
    const code = readFileSync(kitBundle, 'utf8');
    expect(code).not.toContain('ProseMirror');
    expect(code).toMatch(/import\(\s*["']\.\/chunks\/[^"']+\.js["']\s*\)/);
  });
  it.skipIf(!existsSync(kitBundle))('the kit does not statically import a chunk that holds ProseMirror', () => {
    const code = readFileSync(kitBundle, 'utf8');
    const dir = dirname(kitBundle);
    const staticChunks = [...code.matchAll(/(?:^|[;\n])\s*(?:import|export)\b[^;'"]*?\bfrom\s*["'](\.\/chunks\/[^"']+)["']/g)].map((m) => m[1]!);
    for (const chunk of staticChunks) {
      expect(readFileSync(resolve(dir, chunk), 'utf8'), chunk).not.toMatch(/ProseMirror|prosemirror/);
    }
  });
  // 484 kB before the lazy split was restored; the editor's weight lives in chunks the kit loads on demand.
  it.skipIf(!existsSync(kitBundle))('kit.js stays small', () => {
    expect(statSync(kitBundle).size).toBeLessThan(KIT_BYTES_MAX);
  });
});
