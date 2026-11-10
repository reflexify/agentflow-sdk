import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { ComputedTile, ResolvedMention } from '@reflexify/agentflow-sdk';
import { OPTION_COLOR_VALUES } from '@reflexify/agentflow-sdk/figures';
import type { FigureField } from '@reflexify/agentflow-sdk/figures';
import '../../src/kit/index.js';
import type { AfListColumn, AfListRow, AfOpenRecordDetail, AfPageDetail, AfTilePaging, AfTileResult, AfTileSpec } from '../../src/kit/index.js';
import { resolveMention } from '../../src/kit/mention.js';
import { cellText, listModel } from '../../src/kit/tile/list.js';
import type { ListCell } from '../../src/kit/tile/list.js';
import { kitText } from '../../src/kit/text.js';
import { tileResult, uuid } from './fixtures/tile.js';
import { FIELDS, LIST, PIE } from './fixtures/tiles.js';

// A date read in UTC would be the day before in a zone behind it; the cached formatters then keep this zone for the whole file.
vi.stubEnv('TZ', 'America/Los_Angeles');

interface TileElement extends HTMLElement {
  spec: AfTileSpec | null;
  result: AfTileResult | null;
  fields: FigureField[] | null;
  rows: readonly AfListRow[] | null;
  columns: readonly AfListColumn[] | null;
  paging: AfTilePaging | null;
  drill: boolean;
}

const EN = kitText('en');
const VI = kitText('vi');
const parts = (node: Element, name: string) => [...(node.shadowRoot ?? node).querySelectorAll<HTMLElement>(`[part~="${name}"]`)];
const part = (el: Element, name: string) => parts(el, name)[0] ?? null;
const words = (node: Element | null | undefined) => (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
// ICU versions differ on the space before AM/PM (U+202F or U+0020).
const plain = (s: string) => s.replace(/\s/g, ' ');
const rowsOf = (el: Element) => [...part(el, 'list')!.querySelectorAll<HTMLTableRowElement>('tbody > tr')];
// A cell as a reader meets it: a mark by its name, options one by one.
const spoken = (cell: Element) => {
  const badges = [...cell.querySelectorAll('[part~="badge"]')].map(words);
  if (badges.length) return badges.join(', ');
  const mark = cell.querySelector('[role="img"]');
  return mark ? (mark.getAttribute('aria-label') ?? '') : words(cell);
};
const cellsOf = (row: Element) => [...row.children].map(spoken);

function mount(props: Partial<TileElement>, attributes: Record<string, string> = {}) {
  const host = document.createElement('div');
  const root = host.attachShadow({ mode: 'open' });
  const el = document.createElement('af-tile') as TileElement;
  for (const [name, value] of Object.entries(attributes)) el.setAttribute(name, value);
  Object.assign(el, props);
  root.append(el);
  document.body.append(host);
  const heard: { detail: AfOpenRecordDetail; bubbles: boolean; composed: boolean }[] = [];
  const outside: Event[] = [];
  root.addEventListener('af-open-record', (e) => {
    if (e.target === el) heard.push({ detail: (e as CustomEvent<AfOpenRecordDetail>).detail, bubbles: e.bubbles, composed: e.composed });
  });
  document.body.addEventListener('af-open-record', (e) => outside.push(e));
  return { el, heard, outside };
}

// Every field type the fixture's records hold, which are more than a tile fits in a pane.
const EVERY_COLUMN = ['name', 'stage', 'amount', 'owner', 'tags', 'signed', 'opened', 'updated', 'contract'].map((key) => ({ key, label: FIELDS.find((f) => f.key === key)!.label! }));

const listProps = (over: Partial<TileElement> = {}): Partial<TileElement> => ({
  spec: LIST.spec, result: LIST.result, fields: LIST.fields, rows: LIST.rows!, columns: LIST.columns!, ...over,
});
const drawn = (el: Element, name = 'list') => expect.poll(() => part(el, name) !== null, { timeout: 5000 }).toBe(true);
const said = (el: Element) => words(part(el, 'state'));

afterEach(() => {
  document.body.innerHTML = '';
});

const field = (over: Partial<FigureField> & Pick<FigureField, 'type'>): FigureField => ({ key: 'v', ...over });
const rowOf = (value: unknown, extra: Partial<AfListRow> = {}): AfListRow => ({ id: uuid(1), entity_id: uuid(2), body: { v: value }, ...extra });
const STAGES = FIELDS.find((f) => f.key === 'stage')!;
const TAGS = FIELDS.find((f) => f.key === 'tags')!;
const ENUM_ROSE = field({ type: 'enum', enum_values: [{ value: 'overdue', label: 'Overdue', color: 'rose' }, { value: 'open', label: 'Open' }] });
const ENUM_HEX = field({ type: 'enum', enum_values: [{ value: 'paid', label: 'Paid', color: '#0a7d55' }] });
const ENUM_PLAIN = field({ type: 'enum', enum_values: [{ value: 'approved' }, { value: 'draft' }, { value: 'inactive', label: 'Switched off' }, { value: 'new' }] });
const ENUM_ODD = field({ type: 'enum', enum_values: [{ value: 'late', color: 'crimson' }, { value: 'active', color: 'crimson' }, { value: 'bad', color: '#12345' }] });
const MULTI = field({ type: 'multi_select', enum_values: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B', color: 'sky' }] });
const BOOL = field({ type: 'boolean' });
const bar = (format_options: Record<string, unknown>) => field({ type: 'number', format: 'percent', format_options });
const BANDS = [{ at: 80, color: 'emerald' }, { at: 50, color: 'amber' }];
const BAR = bar({ bar: true, bar_bands: BANDS });
const RATING = field({ type: 'number', format: 'rating', format_options: { rating_max: 5 } });
const ID_A = uuid(10);
const ID_B = uuid(11);
const PERSON = uuid(301);
const TOKEN = `@[Hoa Tran](mention:user/${PERSON})`;
const RECORD = `record/${uuid(200)}/${uuid(310)}`;
const ENTITY = `entity/${uuid(301)}`;
const user = (label: string): ResolvedMention => ({ state: 'ok', kind: 'user', id: PERSON, label });
const record = (label: string, href = '/records/r'): ResolvedMention => ({ state: 'ok', kind: 'record', id: uuid(310), entity_id: uuid(200), entity_label: 'Deal', href, label });

describe('a mention, as a viewer reads it', () => {
  const PERSON_REF = `user/${PERSON}`;
  // The token's own name defaults to 'typed'; `inserted` is the editor's own insertion, which the response has no entry for yet.
  const rows: [string, string, Record<string, ResolvedMention>, object, { label?: string; inserted?: boolean }?][] = [
    ['a person', PERSON_REF, { [PERSON_REF]: user('Mai Tran') }, { state: 'ok', kind: 'user', label: 'Mai Tran', href: null }],
    ['a record they may read, which has an address', RECORD, { [RECORD]: record('Acme renewal') }, { state: 'ok', kind: 'record', label: 'Acme renewal', href: '/records/r' }],
    ['a record they may not read', RECORD, { [RECORD]: { state: 'restricted', kind: 'record' } }, { state: 'restricted', label: 'Restricted record', href: null }],
    ['a person they may not read', PERSON_REF, { [PERSON_REF]: { state: 'restricted', kind: 'user' } }, { state: 'restricted', label: 'Restricted person' }],
    ['a deleted record', RECORD, { [RECORD]: { state: 'deleted', kind: 'record' } }, { state: 'deleted', label: 'Deleted record', href: null }],
    ['a deleted person, who keeps the name the token gave', PERSON_REF, { [PERSON_REF]: { state: 'deleted', kind: 'user' } }, { state: 'deleted', label: 'typed' }],
    ['a deleted person whose token gave no name', PERSON_REF, { [PERSON_REF]: { state: 'deleted', kind: 'user' } }, { state: 'deleted', label: 'Deleted record' }, { label: '' }],
    ['a record the map does not name', RECORD, {}, { state: 'restricted', label: 'Restricted record' }],
    ['a person the map does not name', PERSON_REF, {}, { state: 'restricted', label: 'Restricted person' }],
    ['a token the editor has just inserted, which has no entry yet', PERSON_REF, {}, { state: 'ok', label: 'typed', href: null }, { inserted: true }],
  ];
  it.each(rows)('resolves a mention of %s', (_, ref, map, view, options = {}) => {
    expect(resolveMention(ref, options.label ?? 'typed', map, EN, options.inserted)).toMatchObject(view);
  });

  it('reads no map as a map that names nothing', () => {
    for (const map of [null, undefined]) expect(resolveMention(RECORD, 'typed', map, EN), String(map)).toMatchObject({ state: 'restricted', label: 'Restricted record' });
  });
});

describe('a list cell', () => {
  it('reads as the record table words each field type', () => {
    const people = { v: { [ID_A]: 'Hoa Tran', [ID_B]: null } };
    const files = { v: { [ID_A]: 'report.pdf', [ID_B]: null } };
    const rows: [string, FigureField, unknown, Partial<AfListRow>, string, 'en' | 'vi'][] = [
      ['a number in its currency', field({ type: 'number', format: 'currency', format_options: { currency_code: 'USD', decimal_places: 0 } }), 1_240_000, {}, '$1,240,000', 'en'],
      ['a number in the viewer’s locale', field({ type: 'number' }), 1234.5, {}, '1.234,5', 'vi'],
      ['zero is a value', field({ type: 'number' }), 0, {}, '0', 'en'],
      ['an auto-number with a code', field({ type: 'auto_number', auto_number_format: 'INV-{n}' }), 'INV-0042', {}, 'INV-0042', 'en'],
      ['an auto-number stored as a number reads as a number, as the record table reads it', field({ type: 'auto_number' }), 1234, {}, '1,234', 'en'],
      ['a boolean, true', field({ type: 'boolean' }), true, {}, 'Yes', 'en'],
      ['a boolean, false is not empty', field({ type: 'boolean' }), false, {}, 'No', 'en'],
      ['a boolean in Vietnamese', field({ type: 'boolean' }), true, {}, 'Có', 'vi'],
      ['a date-only value is the day as written', field({ type: 'date' }), '2026-02-28', {}, 'Feb 28, 2026', 'en'],
      ['a date field holding a timestamp names the day it was written with', field({ type: 'date' }), '2026-03-01T03:00:00Z', {}, 'Mar 1, 2026', 'en'],
      ['a datetime, in the viewer’s zone', field({ type: 'datetime' }), '2026-03-05T14:30:00Z', {}, 'Mar 5, 2026, 6:30 AM', 'en'],
      ['a datetime in Vietnamese', field({ type: 'datetime' }), '2026-03-05T14:30:00Z', {}, '06:30 5 thg 3, 2026', 'vi'],
      ['an enum by the option’s label', STAGES, 'won', {}, 'Closed won', 'en'],
      ['an enum no longer among the options', STAGES, 'archived', {}, 'archived', 'en'],
      ['a multi-select by the options’ labels', TAGS, ['renewal', 'gone', 'partner'], {}, 'Renewal, gone, Partner', 'en'],
      ['a reference by the label the server resolved', field({ type: 'reference' }), ID_A, { ref_labels: people }, 'Hoa Tran', 'en'],
      ['a reference with no label is its id', field({ type: 'reference' }), ID_B, { ref_labels: people }, ID_B, 'en'],
      ['a reference list, each by its label or its id', field({ type: 'reference_list' }), [ID_A, ID_B], { ref_labels: people }, `Hoa Tran, ${ID_B}`, 'en'],
      ['one file', field({ type: 'file' }), [ID_A], { file_labels: files }, 'report.pdf', 'en'],
      ['two files with no count is +1', field({ type: 'file' }), [ID_A, ID_B], { file_labels: files }, 'report.pdf +1', 'en'],
      ['files the row was cut to two of, counted from the total', field({ type: 'file' }), [ID_A, ID_B], { file_labels: files, file_counts: { v: 5 } }, 'report.pdf +4', 'en'],
      ['a file with no name is unavailable, never its id', field({ type: 'file' }), [ID_B], { file_labels: files }, 'File unavailable', 'en'],
      ['a file in Vietnamese', field({ type: 'file' }), [ID_B], { file_labels: files }, 'Tệp không khả dụng', 'vi'],
      ['a list of three', field({ type: 'list' }), [{}, {}, {}], {}, '3 items', 'en'],
      ['a list of one', field({ type: 'list' }), [{}], {}, '1 item', 'en'],
      ['a list in Vietnamese', field({ type: 'list' }), [{}, {}], {}, '2 mục', 'vi'],
      ['text with its mention as the name the server resolved', field({ type: 'text' }), `Ask ${TOKEN} to review`, { mentions: { [`user/${PERSON}`]: user('Hoa T.') } }, 'Ask @Hoa T. to review', 'en'],
      ['text with an escaped bracket in a deleted mention’s name', field({ type: 'text' }), `@[A \\] B](mention:${ENTITY})`, { mentions: { [ENTITY]: { state: 'deleted', kind: 'entity' } } }, '@A ] B', 'en'],
      ['text with a mention the server did not resolve is restricted, never the token’s name', field({ type: 'text' }), `Ask ${TOKEN} to review`, {}, 'Ask @Restricted person to review', 'en'],
      ['the same in Vietnamese', field({ type: 'text' }), `Ask ${TOKEN} to review`, {}, 'Ask @Người bị hạn chế to review', 'vi'],
      ['text that only looks like a mention', field({ type: 'text' }), 'see [the notes](https://example.com)', {}, 'see [the notes](https://example.com)', 'en'],
      ['a formula by its result type', field({ type: 'formula', formula_result_type: 'boolean' }), true, {}, 'Yes', 'en'],
    ];
    for (const [name, f, value, extra, expected, locale] of rows) {
      expect(plain(cellText(rowOf(value, extra), 'v', f, locale === 'vi' ? VI : EN, locale)), name).toBe(expected);
    }
  });

  it('is a dash for an empty value, whatever the type', () => {
    const types = ['text', 'number', 'boolean', 'date', 'datetime', 'enum', 'multi_select', 'reference', 'reference_list', 'file', 'list'] as const;
    for (const type of types) {
      for (const value of [null, undefined, '', []]) expect(cellText(rowOf(value), 'v', field({ type }), EN, 'en'), `${type} ${JSON.stringify(value)}`).toBe('—');
    }
    expect(cellText(rowOf(1), 'missing', field({ type: 'text' }), EN, 'en'), 'a body without the key').toBe('—');
  });
});

describe('a list cell by kind', () => {
  const cellOfOne = (f: FigureField, value: unknown): ListCell => listModel([rowOf(value)], [{ key: 'v', label: 'V' }], [f], EN, 'en').rows[0]!.cells[0]!;

  it.each<[string, FigureField, unknown, object]>([
    ['a named option colour', ENUM_ROSE, 'overdue', { kind: 'options', text: 'Overdue', options: [{ label: 'Overdue', color: OPTION_COLOR_VALUES.rose }] }],
    ['a custom option colour', ENUM_HEX, 'paid', { kind: 'options', options: [{ label: 'Paid', color: '#0a7d55' }] }],
    ['a colourless option', ENUM_ROSE, 'open', { kind: 'options', options: [{ label: 'Open', color: null }] }],
    ['a colourless legacy status', ENUM_PLAIN, 'approved', { kind: 'options', options: [{ label: 'approved', color: OPTION_COLOR_VALUES.emerald }] }],
    ['a colourless legacy status the options do not name', ENUM_ROSE, 'pending', { kind: 'options', options: [{ label: 'pending', color: OPTION_COLOR_VALUES.amber }] }],
    ['a labelled legacy status', ENUM_PLAIN, 'inactive', { kind: 'options', options: [{ label: 'Switched off', color: OPTION_COLOR_VALUES.rose }] }],
    ['a draft', ENUM_PLAIN, 'draft', { kind: 'options', options: [{ label: 'draft', color: OPTION_COLOR_VALUES.amber }] }],
    ['a colourless option that is no legacy status', ENUM_PLAIN, 'new', { kind: 'options', options: [{ label: 'new', color: null }] }],
    ['a colour that is neither a name nor a hex, on a plain value', ENUM_ODD, 'late', { kind: 'options', options: [{ label: 'late', color: null }] }],
    ['a colour that is neither a name nor a hex, on a legacy value', ENUM_ODD, 'active', { kind: 'options', options: [{ label: 'active', color: OPTION_COLOR_VALUES.emerald }] }],
    ['a short hex', ENUM_ODD, 'bad', { kind: 'options', options: [{ label: 'bad', color: null }] }],
    ['a value no longer among the options', ENUM_ROSE, 'archived', { kind: 'options', options: [{ label: 'archived', color: null }] }],
    ['a value every object inherits', ENUM_ROSE, 'constructor', { kind: 'options', options: [{ label: 'constructor', color: null }] }],
    ['two selected options', MULTI, ['a', 'b'], { kind: 'options', text: 'A, B', options: [{ label: 'A', color: null }, { label: 'B', color: OPTION_COLOR_VALUES.sky }] }],
    ['a lone selected value', MULTI, 'b', { kind: 'options', options: [{ label: 'B', color: OPTION_COLOR_VALUES.sky }] }],
    ['a selection with an empty item', MULTI, ['', 'a'], { kind: 'options', options: [{ label: 'A', color: null }] }],
    ['an object in an enum', ENUM_ROSE, { a: 1 }, { kind: 'text', text: '{"a":1}' }],
    ['a selection holding a number', MULTI, ['a', 2], { kind: 'text', text: 'A, 2' }],
    ['an empty selection', MULTI, [], { kind: 'text', text: '—' }],
    ['true', BOOL, true, { kind: 'boolean', value: true, text: 'Yes' }],
    ['false', BOOL, false, { kind: 'boolean', value: false, text: 'No' }],
    ['a string in a boolean field', BOOL, 'yes', { kind: 'text', text: 'yes' }],
    ['a bar in its band', BAR, 85, { kind: 'number', text: '85%', bar: { percent: 85, color: OPTION_COLOR_VALUES.emerald }, rating: false }],
    ['a bar on the band the value reaches', BAR, 80, { kind: 'number', bar: { percent: 80, color: OPTION_COLOR_VALUES.emerald } }],
    ['a bar in a lower band', BAR, 79.5, { kind: 'number', bar: { percent: 79.5, color: OPTION_COLOR_VALUES.amber } }],
    ['a bar below every band', BAR, 12.5, { kind: 'number', bar: { percent: 12.5, color: null } }],
    ['a bar past its track', BAR, 150, { kind: 'number', bar: { percent: 100, color: OPTION_COLOR_VALUES.emerald } }],
    ['a bar below its track', BAR, -20, { kind: 'number', bar: { percent: 0, color: null } }],
    ['a bar of zero', BAR, 0, { kind: 'number', bar: { percent: 0, color: null } }],
    ['a bar with no bands', bar({ bar: true }), 40, { kind: 'number', bar: { percent: 40, color: null } }],
    ['a band whose colour is not a name', bar({ bar: true, bar_bands: [{ at: 0, color: 'crimson' }] }), 40, { kind: 'number', bar: { percent: 40, color: null } }],
    ['a bar the field turns off', bar({ bar: false, bar_bands: BANDS }), 85, { kind: 'number', bar: null, rating: false }],
    ['a figure with no bar', field({ type: 'number' }), 1234.5, { kind: 'number', text: '1,234.5', bar: null, rating: false }],
    ['a bar on a number that is not finite', BAR, Number.NaN, { kind: 'number', bar: null }],
    ['a bar on a string', BAR, '85', { kind: 'text', text: '85' }],
    ['a rating', RATING, 4, { kind: 'number', bar: null, rating: true }],
    ['a rating that also asks for a bar', field({ type: 'number', format: 'rating', format_options: { bar: true } }), 4, { kind: 'number', bar: null, rating: true }],
    ['a text field', field({ type: 'text' }), 'Acme', { kind: 'text', text: 'Acme' }],
    ['an empty option', ENUM_ROSE, null, { kind: 'text', text: '—' }],
    ['an empty bar', BAR, null, { kind: 'text', text: '—' }],
  ])('draws %s', (_, f, value, cell) => {
    expect(cellOfOne(f, value)).toMatchObject(cell);
  });
});

describe('a list cell of references, files and mentions', () => {
  const people = { v: { [ID_A]: 'Hoang Long Trading', [ID_B]: null } };
  const files = { v: { [ID_A]: 'invoice-0412.pdf', [ID_B]: null } };
  const cellOfOne = (f: FigureField, value: unknown, extra: Partial<AfListRow> = {}): ListCell =>
    listModel([rowOf(value, extra)], [{ key: 'v', label: 'V' }], [f], EN, 'en').rows[0]!.cells[0]!;
  const REFERENCE = field({ type: 'reference' });
  const REFERENCES = field({ type: 'reference_list' });
  const FILE = field({ type: 'file' });
  const TEXT = field({ type: 'text' });

  it.each<[string, FigureField, unknown, Partial<AfListRow>, object]>([
    ['a reference with its label', REFERENCE, ID_A, { ref_labels: people }, { kind: 'refs', text: 'Hoang Long Trading', refs: [{ label: 'Hoang Long Trading', resolved: true }] }],
    ['a reference with no label, as its id', REFERENCE, ID_B, { ref_labels: people }, { kind: 'refs', text: ID_B, refs: [{ label: ID_B, resolved: false }] }],
    ['a reference with no labels at all', REFERENCE, ID_A, {}, { kind: 'refs', refs: [{ label: ID_A, resolved: false }] }],
    ['a reference whose id names a property every object has', REFERENCE, 'constructor', { ref_labels: { v: {} } }, { kind: 'refs', refs: [{ label: 'constructor', resolved: false }] }],
    ['a list of references, each by its label or its id', REFERENCES, [ID_A, ID_B], { ref_labels: people }, {
      kind: 'refs', text: `Hoang Long Trading, ${ID_B}`, refs: [{ label: 'Hoang Long Trading', resolved: true }, { label: ID_B, resolved: false }],
    }],
    ['a list of references with an empty id among them', REFERENCES, ['', ID_A], { ref_labels: people }, { kind: 'refs', refs: [{ label: 'Hoang Long Trading', resolved: true }] }],
    ['a reference that is not an id', REFERENCE, 7, {}, { kind: 'text', text: '7' }],
    ['an empty reference', REFERENCE, null, {}, { kind: 'text', text: '—' }],
    ['the first file, and how many more there are', FILE, [ID_A, ID_B], { file_labels: files }, { kind: 'file', text: 'invoice-0412.pdf +1', name: 'invoice-0412.pdf', unavailable: false, more: 1 }],
    ['one file, with none more', FILE, [ID_A], { file_labels: files }, { kind: 'file', text: 'invoice-0412.pdf', name: 'invoice-0412.pdf', unavailable: false, more: 0 }],
    ['files the row was cut short of, counted from the total', FILE, [ID_A, ID_B], { file_labels: files, file_counts: { v: 5 } }, { kind: 'file', more: 4 }],
    ['a lone file id', FILE, ID_A, { file_labels: files }, { kind: 'file', name: 'invoice-0412.pdf', more: 0 }],
    ['a file with no name, never its id', FILE, [ID_B], { file_labels: files }, { kind: 'file', text: 'File unavailable', name: 'File unavailable', unavailable: true, more: 0 }],
    ['a first file with no name, with more behind it', FILE, [ID_B, ID_A], { file_labels: files }, { kind: 'file', name: 'File unavailable', unavailable: true, more: 1 }],
    ['a file in a row sent without any file names, the id cut short', FILE, [ID_A], {}, { kind: 'file', name: `${ID_A.slice(0, 8)}…`, unavailable: false, more: 0 }],
    ['a file that is not an id', FILE, [7], {}, { kind: 'text', text: '7' }],
    ['text with no mention', TEXT, 'Acme', {}, { kind: 'text', text: 'Acme' }],
    ['text that only looks like a mention', TEXT, 'see [the notes](https://example.com)', {}, { kind: 'text' }],
    ['a mention with no valid target', TEXT, `Ask @[Hoa](mention:user/1) now`, {}, { kind: 'text', text: 'Ask @Hoa now' }],
  ])('draws %s', (_, f, value, extra, cell) => {
    expect(cellOfOne(f, value, extra)).toMatchObject(cell);
  });

  it('draws text that holds a mention as its words and its chips, each chip as this reader may see it', () => {
    const ask = (mentions: Record<string, ResolvedMention> | null | undefined, text = `Ask ${TOKEN} to review`) => cellOfOne(TEXT, text, { mentions });
    expect(ask({ [`user/${PERSON}`]: user('Mai Tran') })).toEqual({
      kind: 'rich',
      text: 'Ask @Mai Tran to review',
      parts: [{ text: 'Ask ' }, { mention: { kind: 'user', state: 'ok', label: 'Mai Tran', href: null } }, { text: ' to review' }],
    });
    expect(ask(null)).toMatchObject({ text: 'Ask @Restricted person to review', parts: [{ text: 'Ask ' }, { mention: { state: 'restricted' } }, { text: ' to review' }] });

    const several = `${TOKEN}@[Acme](mention:${RECORD}) and [old](mention:x) gone`;
    expect(ask({ [`user/${PERSON}`]: user('Mai Tran'), [RECORD]: { state: 'deleted', kind: 'record' } }, several)).toEqual({
      kind: 'rich',
      text: '@Mai Tran@Deleted record and old gone',
      parts: [
        { mention: { kind: 'user', state: 'ok', label: 'Mai Tran', href: null } },
        { mention: { kind: 'record', state: 'deleted', label: 'Deleted record', href: null } },
        { text: ' and old gone' },
      ],
    });
  });

  it('finds a token’s answer under its target in lower case', () => {
    const mixed = '0190F5A0-0000-7000-8000-00000000000A';
    const found = cellOfOne(TEXT, `Ask @[Hoa](mention:user/${mixed}) now`, { mentions: { [`user/${mixed.toLowerCase()}`]: user('Mai Tran') } });
    expect(found.text).toBe('Ask @Mai Tran now');
  });
});

describe('ragged rows', () => {
  it('give text, never a throw', () => {
    const long = { text: 'x'.repeat(100) };
    const rows: [string, FigureField | undefined, unknown, Partial<AfListRow>, string][] = [
      ['a column with no field: text', undefined, 'abc', {}, 'abc'],
      ['a column with no field: a number to 15 significant digits', undefined, 0.1 + 0.2, {}, '0.3'],
      ['a column with no field: a boolean', undefined, true, {}, 'Yes'],
      ['a column with no field: an array', undefined, ['a', 2, null, false], {}, 'a, 2, , No'],
      ['a column with no field: an object as JSON', undefined, { a: 1 }, {}, '{"a":1}'],
      ['a column with no field: an object cut at 80', undefined, long, {}, `{"text":"${'x'.repeat(70)}…`],
      ['an object in a text field', field({ type: 'text' }), { a: 1 }, {}, '{"a":1}'],
      ['a numeric string in a number field', field({ type: 'number' }), '12', {}, '12'],
      ['NaN in a number field', field({ type: 'number' }), Number.NaN, {}, 'NaN'],
      ['a string in a boolean field', field({ type: 'boolean' }), 'yes', {}, 'yes'],
      ['a date nobody can read', field({ type: 'date' }), 'soon', {}, 'soon'],
      ['a day that does not exist', field({ type: 'date' }), '2026-02-31', {}, '2026-02-31'],
      ['a datetime nobody can read', field({ type: 'datetime' }), 'soon', {}, 'soon'],
      ['a number in a date field', field({ type: 'date' }), 20260228, {}, '20,260,228'],
      ['an object in an enum field', STAGES, { a: 1 }, {}, '{"a":1}'],
      ['a lone value in a multi-select', TAGS, 'renewal', {}, 'Renewal'],
      ['a number in a reference field, with no labels at all', field({ type: 'reference' }), 7, {}, '7'],
      ['a reference whose id names a property every object has', field({ type: 'reference' }), 'constructor', { ref_labels: { v: {} } }, 'constructor'],
      ['a reference with ref_labels absent', field({ type: 'reference' }), ID_A, {}, ID_A],
      ['a reference list holding one id', field({ type: 'reference_list' }), ID_A, {}, ID_A],
      ['a file with file_labels absent, the id cut short', field({ type: 'file' }), [ID_A], {}, `${ID_A.slice(0, 8)}…`],
      ['a file whose labels name another field', field({ type: 'file' }), [ID_A], { file_labels: { other: { [ID_A]: 'x.pdf' } } }, `${ID_A.slice(0, 8)}…`],
      ['a lone file id', field({ type: 'file' }), ID_A, { file_labels: { v: { [ID_A]: 'x.pdf' } } }, 'x.pdf'],
      ['a count that is not a number', field({ type: 'file' }), [ID_A, ID_B], { file_labels: { v: { [ID_A]: 'x.pdf' } }, file_counts: { v: 'many' as unknown as number } }, 'x.pdf +1'],
      ['a list that is not an array', field({ type: 'list' }), { a: 1 }, {}, '{"a":1}'],
      ['text with a token that never closes', field({ type: 'text' }), '@[Hoa](mention:user/1', {}, '@[Hoa](mention:user/1'],
      ['a multi-select holding only an empty string', TAGS, [''], {}, '\u2014'],
      ['a reference list holding only an empty string', field({ type: 'reference_list' }), [''], {}, '\u2014'],
      ['a column with no field holding only null', undefined, [null], {}, '\u2014'],
      ['text that is only a mention with no name', field({ type: 'text' }), '[](mention:x)', {}, '\u2014'],
      ['text of only spaces', field({ type: 'text' }), '   ', {}, '\u2014'],
    ];
    for (const [name, f, value, extra, expected] of rows) {
      expect(plain(cellText(rowOf(value, extra), 'v', f, EN, 'en')), name).toBe(expected);
    }
  });

  it('are drawn as far as they go', () => {
    const rows = [
      rowOf('a'),
      { id: uuid(3), entity_id: uuid(2), body: {} },
      rowOf({ deep: [1, 2] }, { id: uuid(4) }),
      rowOf('the same record again', { id: uuid(1) }),
      { entity_id: uuid(2), body: { v: 'no id' } } as unknown as AfListRow,
      { id: '', entity_id: uuid(2), body: { v: 'a blank id' } },
      { entity_id: uuid(2), body: { v: 'no id either' } } as unknown as AfListRow,
    ];
    const model = listModel(rows, [{ key: 'v', label: 'V' }, { key: 'none', label: 'None' }], undefined, EN, 'en');
    expect(model.rows.map((r) => r.cells.map((c) => c.text)), 'a record that comes twice is drawn once, as it first came; rows with no id are all drawn').toEqual([
      ['a', '\u2014'], ['\u2014', '\u2014'], ['{"deep":[1,2]}', '\u2014'], ['no id', '\u2014'], ['a blank id', '\u2014'], ['no id either', '\u2014'],
    ]);
    expect(model.rows.map((r) => r.record), 'a row with no id has no record to open').toEqual([uuid(1), uuid(3), uuid(4), '', '', '']);
    expect(new Set(model.rows.map((r) => r.key)).size, 'and every row has a key of its own').toBe(model.rows.length);
  });

  it('read a key every object inherits as no key', () => {
    const empty = { id: uuid(1), entity_id: uuid(2), body: {} };
    const own = (key: string, value: unknown, extra: Partial<AfListRow> = {}): AfListRow => ({ id: uuid(1), entity_id: uuid(2), body: { [key]: value }, ...extra });
    const rows: [string, AfListRow, FigureField | undefined, string][] = [
      ['no field, no such value', empty, undefined, '\u2014'],
      ['a text field, no such value', empty, field({ key: 'constructor', type: 'text' }), '\u2014'],
      ['a number field, no such value', empty, field({ key: 'constructor', type: 'number' }), '\u2014'],
      ['a reference whose labels have no entry for the field', own('constructor', 'name', { ref_labels: {} }), field({ key: 'constructor', type: 'reference' }), 'name'],
      ['a reference list, the same', own('constructor', ['name', 'length'], { ref_labels: {} }), field({ key: 'constructor', type: 'reference_list' }), 'name, length'],
      ['a file whose labels have no entry for the field', own('constructor', ['name'], { file_labels: {} }), field({ key: 'constructor', type: 'file' }), 'name'],
    ];
    for (const [name, row, f, expected] of rows) {
      const key = f?.key ?? 'constructor';
      expect(cellText(row, key, f, EN, 'en'), name).toBe(expected);
    }
  });
});

describe('the list model', () => {
  it('takes the rows and columns computeTiles reads for a list tile', () => {
    expectTypeOf<NonNullable<ComputedTile['rows']>>().toMatchTypeOf<AfListRow[]>();
    expectTypeOf<NonNullable<ComputedTile['columns']>>().toMatchTypeOf<AfListColumn[]>();
  });

  it("has a heading for each column and a row for each record, in order, with the address of its record, and keeps every cell's words", () => {
    const model = listModel(LIST.rows!, EVERY_COLUMN, LIST.fields, EN, 'en');
    expect(model.head).toEqual(['Deal', 'Stage', 'Amount', 'Owner', 'Tags', 'Signed', 'Opened', 'Updated', 'Contract']);
    expect(model.rows.map((r) => [r.record, r.entity])).toEqual(LIST.rows!.map((r) => [r.id, r.entity_id]));
    expect(model.rows.map((r) => r.cells.map((c) => plain(c.text)))).toEqual([
      ['Acme renewal', 'Closed won', '$48,000', 'Hoa Tran', 'Renewal, Strategic', 'Yes', 'Sep 14, 2026', 'Oct 2, 2026, 2:15 AM', 'acme-renewal.pdf +1'],
      ['Globex expansion', 'Qualified', '$125,000', 'Binh Nguyen', 'Partner', 'No', 'Oct 5, 2026', 'Oct 20, 2026, 7:40 AM', 'globex-msa.pdf +4'],
      ['—', 'New', '—', '—', '—', 'No', 'Oct 26, 2026', '—', '—'],
    ]);
  });

  it('builds a formatter once for a locale, however many rows there are', () => {
    const made: string[] = [];
    const Dates = Intl.DateTimeFormat;
    const Numbers = Intl.NumberFormat;
    const count = (locale: string, rows: number) => {
      made.length = 0;
      const many: AfListRow[] = Array.from({ length: rows }, (_, i) => ({
        id: uuid(i), entity_id: uuid(2), body: { when: '2026-02-28', at: '2026-03-05T14:30:00Z', n: 0.5, items: [1, 2, 3], price: 1234.5, rate: 12.5, size: 7 },
      }));
      const fields: FigureField[] = [
        { key: 'when', type: 'date' },
        { key: 'at', type: 'datetime' },
        { key: 'items', type: 'list' },
        { key: 'price', type: 'number', format: 'currency', format_options: { currency_code: 'USD', decimal_places: 2 } },
        { key: 'rate', type: 'number', format: 'percent' },
        { key: 'size', type: 'number' },
      ];
      const columns = ['when', 'at', 'n', 'items', 'price', 'rate', 'size'].map((key) => ({ key, label: key }));
      Intl.DateTimeFormat = new Proxy(Dates, { construct: (target, args) => (made.push('date'), Reflect.construct(target, args)) });
      Intl.NumberFormat = new Proxy(Numbers, { construct: (target, args) => (made.push('number'), Reflect.construct(target, args)) });
      try {
        listModel(many, columns, fields, EN, locale);
      } finally {
        Intl.DateTimeFormat = Dates;
        Intl.NumberFormat = Numbers;
      }
      return made.length;
    };
    const few = count('de-AT', 2);
    expect(few, 'the first rows build the formatters').toBeGreaterThan(0);
    expect(count('de-CH', 400), 'four hundred rows build no more of them').toBe(few);
  });
});

describe('the list tile', () => {
  it('draws a table: a heading over each column, a row for each record and the cells as text', async () => {
    const { el } = mount(listProps({ columns: EVERY_COLUMN }));
    await drawn(el);
    const table = part(el, 'list')!;
    expect(table.tagName).toBe('TABLE');
    expect([...table.querySelectorAll('thead th')].map((th) => [th.getAttribute('scope'), words(th)])).toEqual(
      EVERY_COLUMN.map((c) => ['col', c.label]),
    );
    const rows = rowsOf(el);
    expect(rows).toHaveLength(3);
    expect(cellsOf(rows[0]!).map(plain)).toEqual(['Acme renewal', 'Closed won', '$48,000', 'Hoa Tran', 'Renewal, Strategic', 'Yes', 'Sep 14, 2026', 'Oct 2, 2026, 2:15 AM', 'acme-renewal.pdf +1']);
    expect(words(part(el, 'title'))).toBe('Open deals');
    expect(part(el, 'table-toggle'), 'a list has no table view').toBeNull();
    expect(part(el, 'notes'), 'and no notes').toBeNull();
  });

  it("says what the page's filter did to it under the table and the pager", async () => {
    const result = { ...LIST.result, coverage: { partial: false, unfiltered_by_dashboard_filter: true } } as AfTileResult;
    const { el } = mount(listProps({ result, paging: { prev: false, next: true } }));
    await drawn(el);
    const notes = part(el, 'notes');
    expect(words(notes)).toBe(EN.tileUnfiltered);
    expect(part(el, 'pager')!.compareDocumentPosition(notes!) & Node.DOCUMENT_POSITION_FOLLOWING, 'after the pager').toBeTruthy();
  });

  // One column of one field, a row for each value.
  const column = async (f: FigureField, values: unknown[], attributes: Record<string, string> = {}, over: Partial<TileElement> = {}) => {
    const rows = values.map((value, i) => rowOf(value, { id: uuid(600 + i) }));
    const made = mount({ spec: LIST.spec, result: LIST.result, fields: [f], columns: [{ key: 'v', label: 'V' }], rows, ...over }, attributes);
    await drawn(made.el);
    return { ...made, cells: rowsOf(made.el).map((r) => r.children[0]!) };
  };

  it('draws an option as a badge in its colour, and a colourless one in the neutral chip', async () => {
    const { cells } = await column(ENUM_ROSE, ['overdue', 'open']);
    const [rose] = parts(cells[0]!, 'badge');
    expect(words(rose)).toBe('Overdue');
    expect(rose!.classList.contains('neutral')).toBe(false);
    expect(rose!.style.backgroundColor).toBe(`color-mix(in oklab, ${OPTION_COLOR_VALUES.rose} 14%, var(--k-surface))`);
    expect(rose!.style.color).toBe(`color-mix(in oklab, ${OPTION_COLOR_VALUES.rose} 70%, var(--k-fg))`);
    expect(rose!.style.borderColor).toBe(`color-mix(in oklab, ${OPTION_COLOR_VALUES.rose} 35%, var(--k-surface))`);

    const [plain] = parts(cells[1]!, 'badge');
    expect(words(plain)).toBe('Open');
    expect(plain!.classList.contains('af-chip') && plain!.classList.contains('neutral'), 'the kit’s neutral chip').toBe(true);
    expect(plain!.getAttribute('style') ?? '', 'which paints itself').toBe('');
  });

  it('draws each selected option as a badge, a custom colour as written', async () => {
    const { cells } = await column(MULTI, [['a', 'b']]);
    expect(parts(cells[0]!, 'badge').map((b) => [words(b), b.classList.contains('neutral')])).toEqual([['A', true], ['B', false]]);
    expect(spoken(cells[0]!)).toBe('A, B');

    const custom = await column(ENUM_HEX, ['paid']);
    expect(part(custom.cells[0]!, 'badge')!.style.backgroundColor).toBe('color-mix(in oklab, #0a7d55 14%, var(--k-surface))');
  });

  it('draws a boolean as a mark with its answer for a name, and a number as a bar or a rating', async () => {
    const yes = await column(BOOL, [true, false]);
    const [check, dash] = yes.cells.map((c) => c.querySelector<HTMLElement | SVGElement>('[role="img"]')!);
    expect([check!.tagName.toLowerCase(), check!.getAttribute('aria-label'), words(check)], 'true is a check').toEqual(['svg', 'Yes', '']);
    expect([dash!.getAttribute('aria-label'), words(dash)], 'false is a dash').toEqual(['No', '—']);
    expect(yes.cells.map(spoken)).toEqual(['Yes', 'No']);

    const bars = await column(BAR, [85, 150, 12.5, null]);
    const fills = bars.cells.map((c) => c.querySelector<HTMLElement>('.fill'));
    expect(fills.map((f) => f?.style.width ?? null), 'a width on the percent scale, a value past it a full track, an empty cell no bar').toEqual(['85%', '100%', '12.5%', null]);
    // The browser writes a colour back in its own spelling: `0.70` as `0.7`.
    const emerald = document.createElement('i').style;
    emerald.backgroundColor = OPTION_COLOR_VALUES.emerald;
    expect(fills.map((f) => f?.style.backgroundColor ?? null), 'the band’s colour, and none below every band').toEqual([emerald.backgroundColor, emerald.backgroundColor, '', null]);
    expect(bars.cells[0]!.querySelector('.track')!.getAttribute('aria-hidden'), 'the figure beside it is the value').toBe('true');
    expect(bars.cells.map((c) => words(c)), 'and the figure is the true one').toEqual(['85%', '150%', '12.5%', '—']);

    const stars = await column(RATING, [4]);
    const rating = stars.cells[0]!.querySelector<HTMLElement>('.rating')!;
    expect(words(rating)).toBe(words(stars.cells[0]));
    expect(stars.cells[0]!.querySelector('.fill'), 'a rating is no bar').toBeNull();
  });

  it('draws a reference as a neutral chip with its label, and one the server did not resolve as its id in the muted ink', async () => {
    const owner = field({ type: 'reference_list' });
    const labels = { v: { [ID_A]: 'Hoang Long Trading', [ID_B]: null } };
    const { cells } = await column(owner, [], {}, { rows: [rowOf([ID_A, ID_B], { id: uuid(600), ref_labels: labels })] });
    const chips = parts(cells[0]!, 'ref');
    expect(chips.map(words)).toEqual(['Hoang Long Trading', ID_B]);
    expect(chips.map((c) => [c.classList.contains('af-chip'), c.classList.contains('neutral'), c.classList.contains('raw')]), 'both are the kit’s neutral chip, and only the id is muted').toEqual([
      [true, true, false], [true, true, true],
    ]);
    expect(chips.flatMap((c) => [...c.querySelectorAll('svg, img')]), 'with no glyph of the entity it points at').toEqual([]);
  });

  it('draws the first file as a chip with a file icon and the rest as a muted count, and a file with no name as unavailable', async () => {
    const files = { v: { [ID_A]: 'invoice-0412.pdf', [ID_B]: null } };
    const { cells } = await column(field({ type: 'file' }), [], {}, {
      rows: [
        rowOf([ID_A, ID_B], { id: uuid(600), file_labels: files }),
        rowOf([ID_A], { id: uuid(601), file_labels: files }),
        rowOf([ID_B], { id: uuid(602), file_labels: files }),
        rowOf([ID_A, ID_B], { id: uuid(603), file_labels: files, file_counts: { v: 5 } }),
      ],
    });
    const chips = cells.map((c) => part(c, 'file')!);
    expect(chips.map((c) => words(c.querySelector('.name'))), 'each chip is the first file’s name').toEqual(['invoice-0412.pdf', 'invoice-0412.pdf', 'File unavailable', 'invoice-0412.pdf']);
    expect(chips.map((c) => [...c.children].filter((child) => child.localName === 'svg').length), 'with an icon').toEqual([1, 1, 1, 1]);
    expect(chips.map((c) => c.classList.contains('unavailable')), 'a file with no name is not drawn as a name').toEqual([false, false, true, false]);
    expect(cells.map((c) => c.querySelector('.more')?.textContent ?? null), 'and what is more than that is a count beside it, never a chip').toEqual(['+1', null, null, '+4']);
    expect(cells.map((c) => parts(c, 'file').length)).toEqual([1, 1, 1, 1]);
  });

  describe('a mention', () => {
    const ref = `user/${PERSON}`;
    const draw = async (value: string, mentions: Record<string, ResolvedMention> | null, attributes: Record<string, string> = {}) =>
      column(TEXT_FIELD, [], attributes, { rows: [rowOf(value, { id: uuid(600), mentions })] });
    const TEXT_FIELD = field({ type: 'text' });

    it('is drawn as the editor draws it, a person with an initial, and is never a link inside a list cell', async () => {
      const { cells } = await draw(`Ask ${TOKEN} to review`, { [ref]: user('Mai Tran') });
      const chip = part(cells[0]!, 'mention')!;
      expect(chip.getAttribute('data-state')).toBe('ok');
      expect(chip.getAttribute('data-kind')).toBe('user');
      expect(words(chip.querySelector('.af-avatar'))).toBe('M');
      expect(chip.querySelector('.af-avatar')!.getAttribute('aria-hidden')).toBe('true');
      expect(words(chip.querySelector('.label'))).toBe('Mai Tran');
      expect(cells[0]!.querySelector('a, [href]'), 'nothing in the cell is a link').toBeNull();
      const read = cells[0]!.cloneNode(true) as Element;
      read.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => hidden.remove());
      expect(words(read), 'and the cell reads around it, as a reader of the table hears it').toBe('Ask Mai Tran to review');
    });

    it('is a record’s icon and name, never a link even when the record has an address', async () => {
      const at = `record/${uuid(200)}/${uuid(310)}`;
      const { cells } = await draw(`See @[Acme](mention:${at})`, { [at]: record('Acme renewal') });
      const chip = part(cells[0]!, 'mention')!;
      expect(chip.getAttribute('data-kind')).toBe('record');
      expect(chip.querySelector('svg[part~="mention-icon"]'), 'the record icon').not.toBeNull();
      expect(chip.querySelector('.af-avatar'), 'and no initial').toBeNull();
      expect(words(chip)).toBe('Acme renewal');
      expect(cells[0]!.querySelector('a, [href]')).toBeNull();
    });

    it('says what the reader may not see in the chip, and shows nothing of what it is', async () => {
      const at = `record/${uuid(200)}/${uuid(310)}`;
      const { cells } = await draw(`@[Secret](mention:${at}) @[Gone](mention:${ref}) @[Also gone](mention:record/${uuid(200)}/${uuid(311)})`, {
        [at]: { state: 'restricted', kind: 'record' },
        [ref]: { state: 'deleted', kind: 'user' },
      });
      const chips = parts(cells[0]!, 'mention');
      expect(chips.map((c) => [c.getAttribute('data-state'), words(c.querySelector('.label'))])).toEqual([
        ['restricted', 'Restricted record'],
        ['deleted', 'Gone'],
        ['restricted', 'Restricted record'],
      ]);
      expect(chips.map((c) => words(c.querySelector('.af-avatar'))), 'a deleted person keeps the initial of the name the token gave, a restricted chip shows nothing of who it is').toEqual(['', 'G', '']);
      expect(chips[0]!.querySelector('svg'), 'nor of what kind of record').toBeNull();
    });

    it('lets a click on a chip reach the row it is in, as a click on any other cell does', async () => {
      const { heard, cells } = await draw(`Ask ${TOKEN}`, { [ref]: user('Mai Tran') }, { drill: '' });
      const chip = part(cells[0]!, 'mention')!;
      expect(chip.closest('button'), 'in the first cell it is inside the row’s button').not.toBeNull();
      chip.click();
      expect(heard.map((h) => h.detail.record)).toEqual([uuid(600)]);
    });
  });

  it('keeps the words of a rich first cell as its button’s name', async () => {
    const { heard, cells } = await column(ENUM_ROSE, ['overdue', null], { drill: '' });
    const buttons = cells.map((c) => c.querySelector('button')!);
    expect(buttons.map(words), 'the badge is inside the button, so the name is its words').toEqual(['Overdue', '—']);
    expect(part(buttons[0]!, 'badge')).not.toBeNull();
    expect(buttons.map((b) => b.getAttribute('aria-label')), 'an empty cell is named by the heading').toEqual([null, 'Open V']);
    buttons[0]!.click();
    expect(heard.map((h) => h.detail.record)).toEqual([uuid(600)]);
  });

  it('is a tab stop only while it scrolls', async () => {
    const widths = { scroll: 300, client: 300 };
    vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockImplementation(function (this: Element) {
      return this.getAttribute('role') === 'region' ? widths.scroll : 0;
    });
    vi.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(function (this: Element) {
      return this.getAttribute('role') === 'region' ? widths.client : 0;
    });
    try {
      const fits = mount(listProps());
      await drawn(fits.el);
      const region = part(fits.el, 'list')!.closest<HTMLElement>('[role="region"]')!;
      expect(region.getAttribute('aria-label'), 'a region is named by the tile').toBe('Open deals');
      expect(region.hasAttribute('tabindex'), 'a table that fits is not one more stop').toBe(false);

      Object.assign(widths, { scroll: 900 });
      const wide = mount(listProps());
      await drawn(wide.el);
      expect(part(wide.el, 'list')!.closest<HTMLElement>('[role="region"]')!.tabIndex, 'wider than its box, a keyboard needs it to scroll').toBe(0);
    } finally {
      vi.restoreAllMocks();
    }
  });

  it('sends af-open-record for a click on a row and for a click on its button, once each, only with drill', async () => {
    const { el, heard, outside } = mount(listProps(), { drill: '' });
    await drawn(el);
    const rows = rowsOf(el);
    const second = LIST.rows![1]!;

    const buttons = rows.map((r) => r.querySelectorAll('button'));
    expect(buttons.map((b) => b.length), 'a button in the first cell of each row, and nowhere else').toEqual([1, 1, 1]);
    const button = rows[1]!.querySelector<HTMLButtonElement>('td:first-child button, th:first-child button')!;
    expect(button.type).toBe('button');
    expect(words(button)).toBe('Globex expansion');
    expect(button.hasAttribute('tabindex'), 'a native button is in the tab order as it is').toBe(false);

    rows[1]!.children[3]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(heard, 'a click on a cell of the row').toEqual([{ detail: { record: second.id, entity: second.entity_id, newTab: false }, bubbles: true, composed: false }]);

    heard.length = 0;
    button.click();
    expect(heard.map((h) => h.detail), 'the button’s own click is one event, not two').toEqual([{ record: second.id, entity: second.entity_id, newTab: false }]);

    heard.length = 0;
    rows[0]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(heard.map((h) => h.detail), 'a click on the row itself').toEqual([{ record: LIST.rows![0]!.id, entity: LIST.rows![0]!.entity_id, newTab: false }]);

    heard.length = 0;
    part(el, 'list')!.querySelector('thead th')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    part(el, 'list')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(heard, 'a heading and the table itself open nothing').toEqual([]);
    expect(outside, 'the event does not leave the shadow root it was sent in').toEqual([]);
  });

  it.each(['ctrlKey', 'metaKey', 'shiftKey'] as const)('asks for a new tab when a row is clicked with %s', async (modifier) => {
    const { el, heard } = mount(listProps(), { drill: '' });
    await drawn(el);
    const row = rowsOf(el)[1]!;
    const record = LIST.rows![1]!;
    const click = (target: Element, init: MouseEventInit = {}) => target.dispatchEvent(new MouseEvent('click', { bubbles: true, ...init }));

    click(row.children[2]!, { [modifier]: true });
    click(row, { [modifier]: true });
    click(row.querySelector('button')!, { [modifier]: true });
    expect(heard.map((h) => h.detail), 'a cell, the row and its button, each with the key held').toEqual(Array(3).fill({ record: record.id, entity: record.entity_id, newTab: true }));

    heard.length = 0;
    click(row.children[2]!);
    row.querySelector('button')!.click();
    expect(heard.map((h) => h.detail.newTab), 'a plain click, and the click a native button makes of Enter or Space').toEqual([false, false]);
  });

  it('asks for a new tab when a row is middle-clicked, and opens nothing on a right click', async () => {
    const { el, heard } = mount(listProps(), { drill: '' });
    await drawn(el);
    const row = rowsOf(el)[1]!;
    const record = LIST.rows![1]!;
    const aux = (target: Element, button: number) => target.dispatchEvent(new MouseEvent('auxclick', { bubbles: true, button }));

    const middle = new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 1 });
    row.children[2]!.dispatchEvent(middle);
    expect(middle.defaultPrevented, 'a middle press starts no autoscroll, as on a link').toBe(true);
    aux(row.children[2]!, 1);
    aux(row.querySelector('button')!, 1);
    aux(row.children[2]!, 2);
    expect(heard.map((h) => h.detail), 'a cell and the row’s button').toEqual(Array(2).fill({ record: record.id, entity: record.entity_id, newTab: true }));
  });

  describe('the pager', () => {
    const pagerOf = (el: Element) => part(el, 'pager');
    const buttonsOf = (el: Element) => [...pagerOf(el)!.querySelectorAll<HTMLButtonElement>('button')];
    function listenPage(el: Element) {
      const heard: CustomEvent<AfPageDetail>[] = [];
      el.addEventListener('af-page', (e) => heard.push(e as CustomEvent<AfPageDetail>));
      return heard;
    }

    it('draws a pager only when paging is set, and sends af-page with the direction', async () => {
      const { el } = mount(listProps({ paging: { prev: false, next: true } }));
      const heard = listenPage(el);
      await drawn(el);
      await drawn(el, 'pager');

      const pager = pagerOf(el)!;
      expect(pager.localName).toBe('nav');
      expect(part(el, 'list')!.compareDocumentPosition(pager) & Node.DOCUMENT_POSITION_FOLLOWING, 'under the table').toBeTruthy();
      const [previous, next] = buttonsOf(el);
      expect([words(previous), words(next)], 'in the language of the page').toEqual(['Previous', 'Next']);
      expect([previous!.type, next!.type]).toEqual(['button', 'button']);
      expect([previous!.className, next!.className]).toEqual(['af-button secondary sm', 'af-button secondary sm']);
      expect([previous!.disabled, next!.disabled], 'no page before the first').toEqual([true, false]);
      expect(pager.hasAttribute('aria-busy')).toBe(false);

      next!.click();
      previous!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(heard.map((e) => e.detail), 'a disabled button sends nothing').toEqual([{ direction: 'next' }]);
      expect([heard[0]!.bubbles, heard[0]!.composed]).toEqual([true, false]);

      el.paging = { prev: true, next: false };
      await expect.poll(() => buttonsOf(el).map((b) => b.disabled)).toEqual([false, true]);
      buttonsOf(el)[0]!.click();
      buttonsOf(el)[1]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(heard.map((e) => e.detail)).toEqual([{ direction: 'next' }, { direction: 'prev' }]);

      el.paging = null;
      await expect.poll(() => pagerOf(el)).toBeNull();
      expect(rowsOf(el), 'the rows stay').toHaveLength(3);
    });

    it('draws no pager when paging is not set', async () => {
      const { el } = mount(listProps());
      await drawn(el);
      expect(pagerOf(el)).toBeNull();
    });

    it('marks the pager busy and sends nothing while a page loads', async () => {
      const { el } = mount(listProps({ paging: { prev: true, next: true, busy: true } }));
      const heard = listenPage(el);
      await drawn(el, 'pager');
      expect(pagerOf(el)!.getAttribute('aria-busy')).toBe('true');
      expect(buttonsOf(el).map((b) => b.disabled), 'both, though both directions have a page').toEqual([true, true]);
      for (const button of buttonsOf(el)) {
        button.click();
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
      expect(heard).toEqual([]);

      el.paging = { prev: true, next: true, busy: false };
      await expect.poll(() => buttonsOf(el).map((b) => b.disabled)).toEqual([false, false]);
      expect(pagerOf(el)!.hasAttribute('aria-busy')).toBe(false);
      buttonsOf(el)[1]!.click();
      expect(heard.map((e) => e.detail)).toEqual([{ direction: 'next' }]);
    });

    it('keeps the pager under an empty page so a reader can go back', async () => {
      const { el } = mount(listProps({ rows: [], paging: { prev: true, next: false } }));
      const heard = listenPage(el);
      await drawn(el, 'pager');
      expect(said(el)).toBe('No records match this view.');
      expect(part(el, 'list')).toBeNull();
      expect(buttonsOf(el).map((b) => b.disabled)).toEqual([false, true]);
      buttonsOf(el)[0]!.click();
      expect(heard.map((e) => e.detail)).toEqual([{ direction: 'prev' }]);
    });

    it('is drawn only under a list: not while it loads, not for a view with no readable column, not for a tile that did not answer', async () => {
      const paging = { prev: true, next: true };
      const rows: [string, Partial<TileElement>][] = [
        ['no rows yet', listProps({ rows: null, paging })],
        ['no columns yet', listProps({ columns: null, paging })],
        ['no column the reader may read', listProps({ columns: [], paging })],
        ['no column and no record', listProps({ columns: [], rows: [], paging })],
        ['unavailable', listProps({ result: tileResult({}, { outcome: 'unavailable' }), paging })],
        ['failed', listProps({ result: tileResult({}, { outcome: 'failed' }), paging })],
      ];
      for (const [name, props] of rows) {
        document.body.innerHTML = '';
        const { el } = mount(props);
        await expect.poll(() => part(el, 'state') !== null, { timeout: 5000, message: name }).toBe(true);
        expect(pagerOf(el), `${name}: no pager`).toBeNull();
      }
    });

    it('says Trước and Sau in Vietnamese', async () => {
      const { el } = mount(listProps({ paging: { prev: true, next: true } }), { locale: 'vi' });
      await drawn(el, 'pager');
      expect(buttonsOf(el).map(words)).toEqual(['Trước', 'Sau']);
    });
  });

  it('names the button of a row whose first cell is empty by the column\u2019s heading', async () => {
    const { el } = mount(listProps(), { drill: '' });
    await drawn(el);
    const buttons = rowsOf(el).map((r) => r.querySelector('button')!);
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual([null, null, 'Open Deal']);
    expect(words(buttons[2])).toBe('\u2014');

    // A name that formats to nothing is as empty as no name.
    const named = (name: unknown): AfListRow => ({ id: uuid(210), entity_id: uuid(200), body: { name } });
    el.rows = [named('   '), { ...named(['']), id: uuid(211) }, { ...named('[](mention:x)'), id: uuid(212) }];
    await expect.poll(() => rowsOf(el).length).toBe(3);
    expect(rowsOf(el).map((r) => [words(r.querySelector('button')), r.querySelector('button')!.getAttribute('aria-label')])).toEqual([
      ['\u2014', 'Open Deal'], ['\u2014', 'Open Deal'], ['\u2014', 'Open Deal'],
    ]);
  });

  it('draws a record that comes twice once, and does not throw for a row with no id', async () => {
    const failures: unknown[] = [];
    const onError = (e: ErrorEvent) => failures.push(e.error ?? e.message);
    window.addEventListener('error', onError);
    try {
      const [first, second, third] = LIST.rows!;
      const { el, heard } = mount(listProps({ rows: [first!, second!] }), { drill: '' });
      await drawn(el);
      const before = rowsOf(el);

      expect(() => {
        el.rows = [first!, first!, third!];
      }, 'a repeated record is not an error for the element\u2019s setter').not.toThrow();
      await expect.poll(() => rowsOf(el).map((r) => words(r.children[0]))).toEqual(['Acme renewal', '\u2014']);
      expect(rowsOf(el)[0], 'the first row of the record stays').toBe(before[0]);

      const loose = { entity_id: uuid(200), body: { name: 'No id' } } as unknown as AfListRow;
      expect(() => {
        el.rows = [first!, loose, { ...loose, body: { name: 'Nor this' } }];
      }).not.toThrow();
      await expect.poll(() => rowsOf(el).map((r) => words(r.children[0]))).toEqual(['Acme renewal', 'No id', 'Nor this']);
      const rows = rowsOf(el);
      expect(rows.map((r) => r.querySelectorAll('button').length), 'a row with no record to open is no control').toEqual([1, 0, 0]);
      expect(rows.map((r) => getComputedStyle(r).cursor), 'and does not look like one').toEqual(['pointer', 'auto', 'auto']);
      rows[1]!.children[0]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(heard, 'and opens nothing').toEqual([]);
      rows[0]!.children[0]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(heard.map((h) => h.detail.record)).toEqual([first!.id]);
    } finally {
      window.removeEventListener('error', onError);
    }
    expect(failures).toEqual([]);
  });

  it('has no button, and opens nothing, without drill', async () => {
    const { el, heard, outside } = mount(listProps());
    await drawn(el);
    expect(part(el, 'list')!.querySelectorAll('button')).toHaveLength(0);
    for (const row of rowsOf(el)) {
      row.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      row.children[1]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
    expect(heard).toEqual([]);
    expect(outside).toEqual([]);

    el.drill = true;
    await expect.poll(() => part(el, 'list')!.querySelectorAll('button').length).toBe(3);
    rowsOf(el)[0]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(heard).toHaveLength(1);

    el.drill = false;
    await expect.poll(() => part(el, 'list')!.querySelectorAll('button').length).toBe(0);
    rowsOf(el)[0]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(heard, 'turning drill off stops the row opening').toHaveLength(1);
  });

  it('keeps a row for the record when a refreshed page brings it again', async () => {
    const { el, heard } = mount(listProps(), { drill: '' });
    await drawn(el);
    const before = new Map(rowsOf(el).map((r, i) => [LIST.rows![i]!.id, r]));

    const next: AfListRow[] = [
      { ...LIST.rows![2]!, body: { ...LIST.rows![2]!.body, name: 'Initech' } },
      { id: uuid(204), entity_id: uuid(200), body: { name: 'Hooli' } },
      LIST.rows![0]!,
    ];
    el.rows = next;
    await expect.poll(() => rowsOf(el).map((r) => words(r.children[0]))).toEqual(['Initech', 'Hooli', 'Acme renewal']);
    const after = rowsOf(el);
    expect(after[0], 'the same record is the same row, moved').toBe(before.get(LIST.rows![2]!.id));
    expect(after[2], 'and so is the third').toBe(before.get(LIST.rows![0]!.id));
    expect(before.has(LIST.rows![1]!.id) && !after.includes(before.get(LIST.rows![1]!.id)!), 'a record that is gone loses its row').toBe(true);

    after[1]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(heard.map((h) => h.detail.record), 'a new row opens its own record').toEqual([uuid(204)]);
  });

  it('waits for its rows and its columns, and says so when there are none', async () => {
    const rows: [string, Partial<TileElement>, string][] = [
      ['no rows yet', listProps({ rows: null }), 'Loading…'],
      ['no columns yet', listProps({ columns: null }), 'Loading…'],
      ['neither', listProps({ rows: null, columns: null }), 'Loading…'],
      ['no result yet', listProps({ result: null }), 'Loading…'],
      ['no records in the view', listProps({ rows: [] }), 'No records match this view.'],
      ['no column the reader may read', listProps({ columns: [] }), "None of this view's columns can be shown to you."],
      ['no column and no record', listProps({ columns: [], rows: [] }), "None of this view's columns can be shown to you."],
      ['unavailable wins over rows that have not come', listProps({ result: tileResult({}, { outcome: 'unavailable' }), rows: null, columns: null }), 'Not available to you This tile is over records you cannot list.'],
      ['unavailable wins over rows that did', listProps({ result: tileResult({}, { outcome: 'unavailable' }) }), 'Not available to you This tile is over records you cannot list.'],
      ['failed wins over empty rows', listProps({ result: tileResult({}, { outcome: 'failed' }), rows: [] }), 'This tile cannot be computed'],
    ];
    for (const [name, props, expected] of rows) {
      document.body.innerHTML = '';
      const { el } = mount(props);
      await expect.poll(() => said(el), { timeout: 5000 }).toBe(expected);
      expect(part(el, 'list'), `${name}: no table`).toBeNull();
      expect(part(el, 'state')!.getAttribute('role') === 'status', `${name}: only loading is announced`).toBe(expected === 'Loading…');
    }

    document.body.innerHTML = '';
    const { el } = mount(listProps({ rows: null }));
    await expect.poll(() => said(el), { timeout: 5000 }).toBe('Loading…');
    el.rows = LIST.rows!;
    await drawn(el);
    expect(part(el, 'state'), 'the rows arrive and the table replaces the skeleton').toBeNull();
  });

  it('draws in the language of the viewer', async () => {
    const { el } = mount(listProps({ rows: [] }), { locale: 'vi' });
    await expect.poll(() => said(el), { timeout: 5000 }).toBe('Không có bản ghi nào khớp chế độ xem này.');

    const unreadable = mount(listProps({ columns: [] }), { locale: 'vi' });
    await expect.poll(() => said(unreadable.el), { timeout: 5000 }).toBe('Không có cột nào của chế độ xem này hiển thị được cho bạn.');
  });

  it('turns from a pie into a list on the same element, with nothing left raised', async () => {
    const failures: unknown[] = [];
    const onError = (e: ErrorEvent) => failures.push(e.error ?? e.message);
    window.addEventListener('error', onError);
    try {
      const { el } = mount({ spec: PIE.spec, result: PIE.result, fields: PIE.fields, drill: true });
      await drawn(el, 'plot');
      const slice = el.shadowRoot!.querySelector<SVGElement>('[role="button"]')!;
      slice.focus();
      await expect.poll(() => el.dataset.raised, { timeout: 3000 }).toBe('true');

      Object.assign(el, { spec: LIST.spec, result: LIST.result, fields: LIST.fields, rows: LIST.rows, columns: LIST.columns });
      await drawn(el);
      expect(part(el, 'plot'), 'the pie is gone').toBeNull();
      expect(part(el, 'legend'), 'and its legend').toBeNull();
      expect(parts(el, 'tooltip'), 'and its tooltip').toHaveLength(0);
      expect(el.dataset.raised).toBe('false');
      expect(rowsOf(el)).toHaveLength(3);

      Object.assign(el, { spec: PIE.spec, result: PIE.result, fields: PIE.fields });
      await drawn(el, 'plot');
      expect(part(el, 'list'), 'and back again').toBeNull();
    } finally {
      window.removeEventListener('error', onError);
    }
    expect(failures).toEqual([]);
  });
});
