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

describe('the package comments', () => {
  const entity = (key: string) =>
    JSON.parse(read(`package/objects/entity/${key}.json`)) as { comments?: { enabled: boolean; closed_when?: { join: string; leaves: { kind: string; rule: { field: string; op: string; value: unknown } }[] } } };

  it('turns comments on for tasks and projects', () => {
    expect(entity('task').comments?.enabled).toBe(true);
    expect(entity('project').comments?.enabled).toBe(true);
  });

  it('closes a task\'s comments while it is frozen', () => {
    const closed = entity('task').comments?.closed_when;
    expect(closed?.leaves).toEqual([{ kind: 'field', rule: { field: 'frozen', op: 'eq', value: true } }]);
    expect(entity('project').comments?.closed_when).toBeUndefined();
  });

  it('tells an installed app the people\'s names and emails, so the people menu works under a ceiling', () => {
    const { requires } = JSON.parse(read('package/manifest.json')) as { requires: { entities: { key: string; fields: Record<string, string> }[] } };
    expect(requires.entities.find((e) => e.key === 'user')?.fields).toEqual({ name: 'text', email: 'text' });
  });
});
