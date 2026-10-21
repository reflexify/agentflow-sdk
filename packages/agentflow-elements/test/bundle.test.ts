import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { defineAgentFlowElements } from '../src/index.js';

// A bare specifier is one that starts with neither `.` nor `/`.
const BARE_IMPORTS = [
  /^\s*(?:import|export)\b[^;'"]*\bfrom\s*['"](?![./])/m,
  /^\s*import\s*['"](?![./])/m,
  /\bimport\(\s*['"](?![./])/,
];
const hasBareImport = (code: string) => BARE_IMPORTS.some((re) => re.test(code));

describe('registration and the bundle', () => {
  it('registering twice is a no-op', () => {
    const before = customElements.get('agentflow-provider');
    expect(() => defineAgentFlowElements()).not.toThrow();
    expect(customElements.get('agentflow-provider')).toBe(before);
    for (const tag of ['agentflow-provider', 'agentflow-task-inbox', 'agentflow-task-detail', 'agentflow-record-table', 'agentflow-start-form']) {
      expect(customElements.get(tag), tag).toBeDefined();
    }
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
});
