// The create-project skill repeats the system templates for the assistant, so
// it must say exactly what the module offers: the same templates in the same
// order, each with its sections and their descriptions.

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { TEMPLATES } from '../../src/model/templates.js';

const body = readFileSync(
  new URL('../../config/skills/create_project.SKILL.md', import.meta.url),
  'utf8',
);

interface Parsed {
  key: string;
  name: string;
  sections: { name: string; description: string }[];
}

/** `### <name> (`<key>`)` headings, each with its `- <name>: <description>` lines. */
function parseSkillTemplates(text: string): Parsed[] {
  const out: Parsed[] = [];
  for (const line of text.split('\n')) {
    const heading = /^### (.+) \(`([a-z_]+)`\)\s*$/.exec(line);
    if (heading) {
      out.push({ key: heading[2]!, name: heading[1]!, sections: [] });
      continue;
    }
    if (/^#{1,3} /.test(line)) {
      if (out.length > 0 && !line.startsWith('### ')) break;
      continue;
    }
    const current = out[out.length - 1];
    const item = /^- (.+?): (.+)$/.exec(line);
    if (current && item) current.sections.push({ name: item[1]!, description: item[2]! });
  }
  return out;
}

describe('the create-project skill', () => {
  it('lists exactly the module’s templates, in order, with their sections', () => {
    expect(parseSkillTemplates(body)).toEqual(
      TEMPLATES.map((t) => ({
        key: t.key,
        name: t.name.vi,
        sections: t.sections.map((s) => ({ name: s.vi.name, description: s.vi.description })),
      })),
    );
  });

  it('says a blank project has no sections', () => {
    expect(body).toMatch(/### Trống \(`blank`\)\n- \(không có hạng mục\)/);
  });

  it('states the limits, the holder rule and the one card', () => {
    expect(body).toMatch(/20 hạng mục/);
    expect(body).toMatch(/30 việc/);
    expect(body).toMatch(/propose_records_create/);
    expect(body).toMatch(/get_entity_create_form/);
    expect(body).toMatch(/origin/);
    expect(body).toMatch(/\$ref/);
  });
});
