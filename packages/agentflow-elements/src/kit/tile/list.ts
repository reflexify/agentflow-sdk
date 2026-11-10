import { colorOf, effectiveType, formatNumber, OPTION_COLOR_VALUES, optionsOf } from '@reflexify/agentflow-sdk/figures';
import type { FigureField, FormatOptions, OptionColor } from '@reflexify/agentflow-sdk/figures';
import { parseDateOnly } from '../../format.js';
import { resolveMention } from '../mention-chip.js';
import type { MentionView } from '../mention-chip.js';
import { scanToken } from '../mention-token.js';
import { fill } from '../text.js';
import type { KitStrings } from '../text.js';
import type { AfListColumn, AfListRow } from './types.js';

type Text = Required<KitStrings>;

/** A stretch of a rich cell: plain words, or a mention as this reader may see it. */
export type RichPart = { text: string } | { mention: MentionView };

/**
 * What a cell draws. Every kind keeps `text`, the words the cell holds: the row button's name, and what a reader of the table is told.
 * A `color` is a CSS colour, or `null` for the neutral one.
 */
export type ListCell =
  | { kind: 'text'; text: string }
  | { kind: 'options'; text: string; options: { label: string; color: string | null }[] }
  | { kind: 'boolean'; text: string; value: boolean }
  | { kind: 'number'; text: string; bar: { percent: number; color: string | null } | null; rating: boolean }
  | { kind: 'refs'; text: string; refs: { label: string; resolved: boolean }[] }
  | { kind: 'file'; text: string; name: string; unavailable: boolean; more: number }
  | { kind: 'rich'; text: string; parts: RichPart[] };

export interface ListModel {
  head: string[];
  /** A row's `key` is its record's id, or its place for a row with no id; `record` and `entity` are empty when the row cannot say which record it is. */
  rows: { key: string; record: string; entity: string; cells: ListCell[] }[];
}

/** What a cell with no value says. */
export const NO_VALUE = '—';

// `[label](mention:…)`, where the label may hold an escaped bracket. The label's characters and its escapes cannot overlap, so the scan is linear.
const MENTION = /\[((?:\\[\s\S]|[^\]\\[\r\n])*)\]\(mention:[^)]*\)/g;
const DATETIME = /^\d{4}-\d{2}-\d{2}T/;
const SHORT_ID = 8;

// The tones the record browser gives a colourless option by what it is called.
const LEGACY_TONES = new Map<string, OptionColor>([
  ['approved', 'emerald'], ['active', 'emerald'],
  ['draft', 'amber'], ['pending', 'amber'],
  ['suspended', 'rose'], ['inactive', 'rose'],
]);

// One formatter for each locale and style, for every list this page draws.
const formatters = new Map<string, Intl.DateTimeFormat | Intl.NumberFormat>();

function formatter<T extends Intl.DateTimeFormat | Intl.NumberFormat>(style: string, locale: string | undefined, make: () => T): T {
  const key = `${style}|${locale ?? ''}`;
  let found = formatters.get(key);
  if (!found) formatters.set(key, (found = make()));
  return found as T;
}

const dayFormat = (locale?: string) => formatter('day', locale, () => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }));
const momentFormat = (locale?: string) => formatter('moment', locale, () => new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }));
const digitsFormat = (locale?: string) => formatter('digits', locale, () => new Intl.NumberFormat(locale, { maximumSignificantDigits: 15 }));
const countFormat = (locale?: string) => formatter('count', locale, () => new Intl.NumberFormat(locale));

/** What a column reads its cells by, worked out once for the column rather than for each cell. */
interface Column {
  key: string;
  field: FigureField | undefined;
  /** The field's effective type. */
  type: string | undefined;
  /** For an enum or a multi-select: each option's label by its value. */
  labels: Map<string, string> | null;
  /** For an enum or a multi-select: the colour of each option that has one, by its value. */
  colors: Map<string, string> | null;
  /** For a number: the bands of its bar in the order the server keeps them, or `null` when it draws none. */
  bands: Band[] | null;
  rating: boolean;
}

interface Band {
  at: number;
  color: string | null;
}

/** The bands of a number field's bar, or `null` when the field draws no bar. */
function bandsOf(field: FigureField | undefined): Band[] | null {
  const options: unknown = field?.format_options;
  if (options === null || typeof options !== 'object' || Array.isArray(options) || (options as { bar?: unknown }).bar !== true) return null;
  const given: unknown = (options as { bar_bands?: unknown }).bar_bands;
  const bands: Band[] = [];
  if (Array.isArray(given)) {
    for (const band of given as unknown[]) {
      if (band === null || typeof band !== 'object') continue;
      const { at, color } = band as { at?: unknown; color?: unknown };
      if (typeof at === 'number' && Number.isFinite(at)) bands.push({ at, color: colorOf(typeof color === 'string' ? color : null)?.value ?? null });
    }
  }
  return bands;
}

function columnOf(key: string, field: FigureField | undefined): Column {
  const type = field ? effectiveType(field) : undefined;
  let labels: Map<string, string> | null = null;
  let colors: Map<string, string> | null = null;
  if (field && (type === 'enum' || type === 'multi_select')) {
    labels = new Map();
    colors = new Map();
    for (const option of optionsOf(field)) {
      if (option.label) labels.set(option.value, option.label);
      const color = colorOf(option.color);
      if (color) colors.set(option.value, color.value);
    }
  }
  return { key, field, type, labels, colors, bands: type === 'number' ? bandsOf(field) : null, rating: type === 'number' && field?.format === 'rating' };
}

const listOf = (value: unknown): unknown[] => (Array.isArray(value) ? value : [value]);

function json(value: object): string {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

/** A value of a field this build knows nothing about, or of a shape its field does not hold, as the record table words it. */
function plain(value: unknown, text: Text, locale?: string): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return digitsFormat(locale).format(value);
  if (typeof value === 'boolean') return value ? text.tileYes : text.tileNo;
  if (Array.isArray(value)) return value.map((item) => plain(item, text, locale)).join(', ');
  const written = typeof value === 'object' ? json(value) : String(value);
  return written.length > 80 ? `${written.slice(0, 79)}…` : written;
}

const unescapeLabel = (label: string) => label.replace(/\\([\s\S])/g, '$1');

/** Text with each mention as its label: the server has already left a restricted record's token without one it may not tell. */
const withoutMentions = (value: string) => (value.includes('](mention:') ? value.replace(MENTION, (_whole, label: string) => unescapeLabel(label)) : value);

/** What the server stored under `key`, never what every object inherits: `constructor` is a legal field key and a legal id. */
function own<T>(record: Readonly<Record<string, T>> | null | undefined, key: string): T | undefined {
  return record && Object.hasOwn(record, key) ? record[key] : undefined;
}

function optionText(item: unknown, labels: Map<string, string> | null, text: Text, locale?: string): string {
  return typeof item === 'string' ? (labels?.get(item) ?? item) : plain(item, text, locale);
}

/** A reference by the label the server resolved for it, or by its id when it named none. */
function referenceName(id: string, labels: Record<string, string | null> | undefined): { label: string; resolved: boolean } {
  const label = own(labels, id);
  return typeof label === 'string' && label !== '' ? { label, resolved: true } : { label: id, resolved: false };
}

function referenceText(item: unknown, labels: Record<string, string | null> | undefined, text: Text, locale?: string): string {
  return typeof item === 'string' ? referenceName(item, labels).label : plain(item, text, locale);
}

/** The first file of a field: its name, whether the server could not name it, and how many more the field holds. `null` when the value holds no file id. */
function fileOf(row: AfListRow, key: string, value: unknown, text: Text): { name: string; unavailable: boolean; more: number } | null {
  const ids = listOf(value);
  const first = ids[0];
  if (typeof first !== 'string') return null;
  const labels = own(row.file_labels, key);
  const name = own(labels, first);
  const counted = own(row.file_counts, key);
  const total = typeof counted === 'number' && Number.isFinite(counted) ? counted : ids.length;
  const more = total > 1 ? total - 1 : 0;
  if (typeof name === 'string' && name !== '') return { name, unavailable: false, more };
  // A file with no name was deleted or its name is withheld, and is never shown as its id; only a row sent without any file names falls back to the id.
  if (labels) return { name: text.tileFileUnavailable, unavailable: true, more };
  return { name: first.length > SHORT_ID ? `${first.slice(0, SHORT_ID)}…` : first, unavailable: false, more };
}

function fileText(row: AfListRow, key: string, value: unknown, text: Text, locale?: string): string {
  const file = fileOf(row, key, value, text);
  if (!file) return plain(value, text, locale);
  return file.more > 0 ? `${file.name} +${file.more}` : file.name;
}

/**
 * A string read for the mentions it holds, each as this reader may see it, or `null` when it holds none.
 * Only a well-formed token is a mention; anything else that looks like one is read as its label, as it always was.
 */
function richOf(value: string, row: AfListRow, text: Text): { text: string; parts: RichPart[] } | null {
  if (!value.includes('](mention:')) return null;
  const parts: RichPart[] = [];
  let words = '';
  let from = 0;
  const plainTo = (end: number) => {
    const between = withoutMentions(value.slice(from, end));
    if (between !== '') {
      parts.push({ text: between });
      words += between;
    }
  };
  let at = value.indexOf('@[');
  while (at >= 0) {
    const token = scanToken(value.slice(at));
    if (!token) {
      at = value.indexOf('@[', at + 1);
      continue;
    }
    plainTo(at);
    const mention = resolveMention(token.ref, token.label, row.mentions, text);
    parts.push({ mention });
    words += `@${mention.label}`;
    from = at + token.raw.length;
    at = value.indexOf('@[', from);
  }
  if (parts.length === 0) return null;
  plainTo(value.length);
  return { text: words, parts };
}

function wordsOf(row: AfListRow, column: Column, text: Text, locale?: string): string {
  const { key, field, labels } = column;
  const value: unknown = own(row.body, key);
  if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) return '';

  switch (column.type) {
    case 'number':
      return typeof value === 'number' ? formatNumber(value, field?.format, field?.format_options as FormatOptions | null | undefined, locale) : plain(value, text, locale);
    case 'boolean':
      return typeof value === 'boolean' ? (value ? text.tileYes : text.tileNo) : plain(value, text, locale);
    case 'date': {
      // A date names a day: a timestamp in the field is read as the day it was written with, never moved by the viewer's zone.
      const day = typeof value === 'string' ? parseDateOnly(value.charAt(10) === 'T' ? value.slice(0, 10) : value) : null;
      return day ? dayFormat(locale).format(day) : plain(value, text, locale);
    }
    case 'datetime': {
      const moment = typeof value === 'string' && DATETIME.test(value) ? new Date(value) : null;
      return moment && !Number.isNaN(moment.getTime()) ? momentFormat(locale).format(moment) : plain(value, text, locale);
    }
    case 'enum':
      return optionText(value, labels, text, locale);
    case 'multi_select':
      return listOf(value).map((item) => optionText(item, labels, text, locale)).join(', ');
    case 'reference':
      return referenceText(value, own(row.ref_labels, key), text, locale);
    case 'reference_list': {
      const names = own(row.ref_labels, key);
      return listOf(value).map((item) => referenceText(item, names, text, locale)).join(', ');
    }
    case 'file':
      return fileText(row, key, value, text, locale);
    case 'list':
      return Array.isArray(value) ? fill(value.length === 1 ? text.tileItemsOne : text.tileItems, { count: countFormat(locale).format(value.length) }) : plain(value, text, locale);
    default:
      return typeof value === 'string' ? (richOf(value, row, text)?.text ?? withoutMentions(value)) : plain(value, text, locale);
  }
}

const SOMETHING = /\S/;

/** An option's colour: its own, else the tone its value has as a legacy status, else none. */
function colorOfOption(value: string, column: Column): string | null {
  const own = column.colors?.get(value);
  if (own) return own;
  const legacy = LEGACY_TONES.get(value);
  return legacy ? OPTION_COLOR_VALUES[legacy] : null;
}

/** The options a value of an enum or a multi-select holds, or `null` when it holds something else or nothing to show. */
function optionsOfValue(value: unknown, column: Column): { label: string; color: string | null }[] | null {
  const items = column.type === 'multi_select' ? listOf(value) : [value];
  if (!items.every((item) => typeof item === 'string')) return null;
  const options = (items as string[]).map((item) => ({ label: column.labels?.get(item) ?? item, color: colorOfOption(item, column) })).filter((option) => SOMETHING.test(option.label));
  return options.length ? options : null;
}

/** The bar a number draws: its place on the percent scale, in the colour of the first band it reaches. */
function barOf(value: number, bands: Band[] | null): { percent: number; color: string | null } | null {
  if (!bands || !Number.isFinite(value)) return null;
  return { percent: Math.min(Math.max(value, 0), 100), color: bands.find((band) => value >= band.at)?.color ?? null };
}

/** The references a value of a reference field holds, or `null` when it holds something else or nothing to show. */
function refsOf(row: AfListRow, key: string, value: unknown): { label: string; resolved: boolean }[] | null {
  const items = listOf(value);
  if (!items.every((item) => typeof item === 'string')) return null;
  const names = own(row.ref_labels, key);
  const refs = (items as string[]).map((item) => referenceName(item, names)).filter((ref) => SOMETHING.test(ref.label));
  return refs.length ? refs : null;
}

/** A cell with words in it, or a dash: a value that formats to nothing, as a list of one empty string does, is as empty as no value. */
function cellOf(row: AfListRow, column: Column, text: Text, locale?: string): ListCell {
  const words = wordsOf(row, column, text, locale);
  if (!SOMETHING.test(words)) return { kind: 'text', text: NO_VALUE };
  const value: unknown = own(row.body, column.key);
  switch (column.type) {
    case 'enum':
    case 'multi_select': {
      const options = optionsOfValue(value, column);
      return options ? { kind: 'options', text: words, options } : { kind: 'text', text: words };
    }
    case 'boolean':
      return typeof value === 'boolean' ? { kind: 'boolean', text: words, value } : { kind: 'text', text: words };
    case 'number':
      // A rating is its stars, never a bar; a value of another shape is shown as it came.
      return typeof value === 'number'
        ? { kind: 'number', text: words, bar: column.rating ? null : barOf(value, column.bands), rating: column.rating }
        : { kind: 'text', text: words };
    case 'reference':
    case 'reference_list': {
      const refs = refsOf(row, column.key, value);
      return refs ? { kind: 'refs', text: words, refs } : { kind: 'text', text: words };
    }
    case 'file': {
      const file = fileOf(row, column.key, value, text);
      return file ? { kind: 'file', text: words, ...file } : { kind: 'text', text: words };
    }
    default: {
      const rich = typeof value === 'string' ? richOf(value, row, text) : null;
      return rich ? { kind: 'rich', text: words, parts: rich.parts } : { kind: 'text', text: words };
    }
  }
}

/** One cell of a record, worded as the record table words it. A value of a shape its field does not hold is shown as text, and an empty one as a dash. */
export function cellText(row: AfListRow, key: string, field: FigureField | undefined, text: Text, locale?: string): string {
  return cellOf(row, columnOf(key, field), text, locale).text;
}

/** The table a list tile draws. Each column is read by its field once, however many rows there are. */
export function listModel(
  rows: readonly AfListRow[],
  columns: readonly AfListColumn[],
  fields: readonly FigureField[] | null | undefined,
  text: Text,
  locale?: string,
): ListModel {
  const byKey = new Map((fields ?? []).map((field) => [field.key, field]));
  const plan = columns.map((column) => columnOf(column.key, byKey.get(column.key)));
  const seen = new Set<string>();
  const drawn: ListModel['rows'] = [];
  rows.forEach((row, place) => {
    const record = typeof row.id === 'string' ? row.id : '';
    // A record that comes twice, as it can when an app puts pages together, is drawn once, as it first came; a row with no id is keyed by its place.
    const key = record !== '' ? record : `#${place}`;
    if (seen.has(key)) return;
    seen.add(key);
    const entity = typeof row.entity_id === 'string' ? row.entity_id : '';
    drawn.push({ key, record, entity, cells: plan.map((column) => cellOf(row, column, text, locale)) });
  });
  return { head: columns.map((column) => column.label), rows: drawn };
}
