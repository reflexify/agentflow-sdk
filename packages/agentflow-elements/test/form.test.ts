import { describe, expect, it } from 'vitest';
import { blockingFields, errorsByField, fieldsOf, initialValues, missingRequired, toPayload } from '../src/form.js';

const schema = {
  type: 'object',
  required: ['title', 'amount'],
  'x-order': ['amount', 'title'],
  properties: {
    title: { type: 'string', title: 'Title' },
    amount: { type: 'integer', title: 'Amount' },
    due: { type: 'string', format: 'date' },
    when: { type: ['string', 'null'], format: 'date-time' },
    mail: { type: 'string', format: 'email' },
    rate: { type: 'number' },
    urgent: { type: 'boolean', title: 'Urgent' },
    level: { type: 'string', enum: ['low', 'high'] },
    tier: { oneOf: [{ const: 'g', title: 'Gold' }, { const: 's', title: 'Silver' }] },
    owner: { type: 'string', format: 'user' },
    lines: { type: 'array', items: { type: 'string' } },
  },
};

describe('fieldsOf', () => {
  it('orders by x-order, then the rest, and maps each supported type', () => {
    const f = fieldsOf(schema);
    expect(f.map((x) => [x.key, x.kind])).toEqual([
      ['amount', 'integer'],
      ['title', 'text'],
      ['due', 'date'],
      ['when', 'datetime'],
      ['mail', 'email'],
      ['rate', 'number'],
      ['urgent', 'boolean'],
      ['level', 'choice'],
      ['tier', 'choice'],
      ['owner', 'unsupported'],
      ['lines', 'unsupported'],
    ]);
    expect(f.find((x) => x.key === 'tier')?.options).toEqual([
      { value: 'g', label: 'Gold' },
      { value: 's', label: 'Silver' },
    ]);
    expect(f.find((x) => x.key === 'amount')).toMatchObject({ label: 'Amount', required: true });
    expect(f.find((x) => x.key === 'due')).toMatchObject({ label: 'due', required: false });
  });
  it('gives no fields for a schema without properties', () => {
    expect(fieldsOf(null)).toEqual([]);
    expect(fieldsOf({ type: 'object' })).toEqual([]);
  });
  it('lists a key once when x-order repeats it', () => {
    const s = { type: 'object', 'x-order': ['b', 'a', 'b'], properties: { a: { type: 'string' }, b: { type: 'string' } } };
    expect(fieldsOf(s).map((x) => x.key)).toEqual(['b', 'a']);
  });
  it('ignores an x-order entry that is not an own property', () => {
    const s = { type: 'object', 'x-order': ['toString', 'title'], properties: { title: { type: 'string' } } };
    expect(fieldsOf(s).map((x) => x.key)).toEqual(['title']);
  });
  it('offers a repeated option value once, with its first title', () => {
    const s = {
      type: 'object',
      properties: {
        letter: { type: 'string', enum: ['a', 'a', 'b'] },
        tier: { oneOf: [{ const: 'g', title: 'Gold' }, { const: 'g', title: 'Gilt' }, { const: 's', title: 'Silver' }] },
      },
    };
    const [letter, tier] = fieldsOf(s);
    expect(letter?.options).toEqual([
      { value: 'a', label: 'a' },
      { value: 'b', label: 'b' },
    ]);
    expect(tier?.options).toEqual([
      { value: 'g', label: 'Gold' },
      { value: 's', label: 'Silver' },
    ]);
  });
  it('cannot edit a oneOf whose consts are not strings', () => {
    const s = { type: 'object', properties: { n: { type: 'integer', oneOf: [{ const: 1, title: 'One' }, { const: 2, title: 'Two' }] } } };
    expect(fieldsOf(s)[0]?.kind).toBe('unsupported');
  });
  it('does not offer the null branch of a oneOf', () => {
    const s = {
      type: 'object',
      properties: { tier: { type: ['string', 'null'], oneOf: [{ const: 'g', title: 'Gold' }, { const: null, title: 'None' }] } },
    };
    expect(fieldsOf(s)[0]).toMatchObject({ kind: 'choice', options: [{ value: 'g', label: 'Gold' }] });
  });
  it('offers the strings of a nullable enum, without the null', () => {
    const s = { type: 'object', properties: { level: { type: ['string', 'null'], enum: ['low', 'high', null] } } };
    expect(fieldsOf(s)[0]).toMatchObject({
      kind: 'choice',
      options: [
        { value: 'low', label: 'low' },
        { value: 'high', label: 'high' },
      ],
    });
  });
  it('cannot edit an enum that is not all strings, whatever its type', () => {
    const s = {
      type: 'object',
      properties: { n: { type: 'integer', enum: [1, 2, 3] }, mixed: { type: 'string', enum: ['a', 1] } },
    };
    expect(fieldsOf(s).map((x) => x.kind)).toEqual(['unsupported', 'unsupported']);
  });
  it('cannot edit a choice that has nothing to choose', () => {
    const s = { type: 'object', properties: { e: { enum: [null] }, o: { oneOf: [{ const: null }] } } };
    expect(fieldsOf(s).map((x) => x.kind)).toEqual(['unsupported', 'unsupported']);
  });
});

describe('fieldsOf with a layout', () => {
  const control = (key: string) => ({ type: 'Control', scope: `#/properties/${key}` });
  const s = {
    type: 'object',
    'x-order': ['e', 'd', 'c', 'b', 'a'],
    properties: { a: { type: 'string' }, b: { type: 'string' }, c: { type: 'string' }, d: { type: 'string' }, e: { type: 'string' } },
  };
  const keys = (uiSchema: unknown) => fieldsOf(s, uiSchema).map((x) => x.key);

  it("follows the layout's controls through groups and horizontal layouts", () => {
    const ui = {
      type: 'VerticalLayout',
      elements: [
        { type: 'Group', label: 'One', elements: [control('c'), { type: 'HorizontalLayout', elements: [control('a'), control('e')] }] },
        { type: 'Group', label: 'Two', elements: [control('b'), control('d')] },
      ],
    };
    expect(keys(ui)).toEqual(['c', 'a', 'e', 'b', 'd']);
  });
  it('puts the fields the layout leaves out after it, in x-order and then object order', () => {
    const ui = { type: 'VerticalLayout', elements: [{ type: 'Group', elements: [control('c')] }] };
    expect(keys(ui)).toEqual(['c', 'e', 'd', 'b', 'a']);
    const partial = { type: 'object', 'x-order': ['d'], properties: s.properties };
    expect(fieldsOf(partial, ui).map((x) => x.key)).toEqual(['c', 'd', 'a', 'b', 'e']);
  });
  it('ignores a nested or unknown scope and a malformed layout', () => {
    const ui = {
      type: 'VerticalLayout',
      elements: [
        { type: 'Control', scope: '#/properties/a/properties/b' },
        { type: 'Control', scope: '#/properties/missing' },
        { type: 'Control', scope: '#/properties/toString' },
        { type: 'Group', elements: 'not a list' },
        null,
        control('b'),
      ],
    };
    expect(keys(ui)).toEqual(['b', 'e', 'd', 'c', 'a']);
    for (const bad of [undefined, null, 'VerticalLayout', [], { type: 'VerticalLayout' }]) {
      expect(keys(bad)).toEqual(['e', 'd', 'c', 'b', 'a']);
    }
  });
});

describe('values', () => {
  const f = fieldsOf(schema);
  it('starts from the source and keeps unsupported values untouched', () => {
    const v = initialValues(f, { title: 'A', owner: 'u1', when: '2026-09-25T10:30:00Z' });
    expect(v.title).toBe('A');
    expect(v.owner).toBe('u1');
    expect(v.when).toBe('2026-09-25T17:30'); // the tests run at UTC+7 (vite.config.ts)
    expect(v.urgent).toBe(false);
  });
  it('round-trips a date-time through the local input value', () => {
    const iso = '2026-09-25T10:30:00.000Z';
    expect(toPayload(f, initialValues(f, { when: iso })).when).toBe(iso);
  });
  it('coerces numbers, drops empty optional fields, and converts local date-times to ISO', () => {
    const p = toPayload(f, { title: 'A', amount: '12', rate: '', due: '', when: '2026-09-25T10:30', urgent: true, owner: 'u1' });
    expect(p).toMatchObject({ title: 'A', amount: 12, urgent: true, owner: 'u1' });
    expect(p).not.toHaveProperty('rate');
    expect(p).not.toHaveProperty('due');
    expect(p.when).toBe(new Date('2026-09-25T10:30').toISOString());
  });
  it('names the required fields that are empty', () => {
    expect(missingRequired(f, { title: '', amount: '' })).toEqual(['amount', 'title']);
    expect(missingRequired(f, { title: 'x', amount: 0 })).toEqual([]);
  });
  it('blocks submit on a required field it cannot edit', () => {
    const s = { type: 'object', required: ['owner'], properties: { owner: { type: 'string', format: 'user' } } };
    expect(blockingFields(fieldsOf(s)).map((x) => x.key)).toEqual(['owner']);
  });
  it('maps server field errors to top-level fields', () => {
    expect(errorsByField([{ path: '/amount', message: 'must be ≥ 1' }, { path: '/lines/0', message: 'bad' }, { path: '', message: 'whole form' }]))
      .toEqual({ amount: 'must be ≥ 1', lines: 'bad', '': 'whole form' });
  });
});
