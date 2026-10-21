import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('the example package', () => {
  it('has the scripts the build and the checks run', () => {
    const { scripts } = JSON.parse(read('package.json')) as { scripts: Record<string, string> };
    for (const name of ['dev', 'build:package', 'build:ui', 'test:ui', 'pack:app', 'test:pack', 'typecheck', 'test', 'e2e']) {
      expect(scripts[name], name).toBeTruthy();
    }
  });

  it('builds the module outside dist/ and ignores it', () => {
    expect(read('vite.module.config.ts')).toContain("outDir: 'ui-dist'");
    expect(read('.gitignore').split('\n')).toContain('ui-dist/');
  });

  it('ignores the module the build writes into package/ui, so the committed package never holds it', () => {
    expect(read('.gitignore').split('\n')).toContain('/package/ui/');
  });
});
