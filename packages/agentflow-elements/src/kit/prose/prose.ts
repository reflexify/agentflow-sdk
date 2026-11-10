import { Lexer, Marked } from 'marked';
import type { Token, Tokens } from 'marked';
import { scanToken } from '../mention-token.js';

export type ProseInline =
  | { kind: 'text'; text: string }
  | { kind: 'break' }
  | { kind: 'code'; text: string }
  | { kind: 'strong' | 'em' | 'del'; children: ProseInline[] }
  | { kind: 'link'; href: string; children: ProseInline[] }
  | { kind: 'mention'; ref: string; label: string };

export type ProseBlock =
  | { kind: 'paragraph'; children: ProseInline[] }
  | { kind: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; children: ProseInline[] }
  | { kind: 'list'; ordered: boolean; start: number; items: { checked: boolean | null; children: ProseBlock[] }[] }
  | { kind: 'quote'; children: ProseBlock[] }
  | { kind: 'code'; text: string }
  | { kind: 'rule' }
  | { kind: 'plain'; text: string }
  | { kind: 'table'; align: ('left' | 'center' | 'right' | null)[]; head: ProseInline[][]; rows: ProseInline[][][] };

/** The deepest quote, list or emphasis the tree keeps. Real prose stops at a handful; past this the rest is shown as it was typed, so neither the mapping nor the components that draw it recurse without bound. */
const MAX_DEPTH = 24;

/** How much of a body is read as Markdown. The rest is drawn as plain text, so the parser's work, and the elements drawn, are bounded by this and not by what a body holds. */
const LEX_MAX = 20_000;

/**
 * Marked finds the end of an emphasis mark, a link or a code span by scanning the rest of its paragraph, so a paragraph with n openers over m characters costs about n times m: 20,000 characters of unclosed `*a ` take three seconds. This is the most such work, summed over every run of inline text in a body, that is read as Markdown: about 35 ms of marked's time at its worst. A run that would pass it is kept as the text it is, with its line breaks. An emphasis mark costs marked about 16 times what the opener of a link, an image or a code span does, so those count a sixteenth.
 */
const INLINE_WORK_MAX = 16_000_000;
const OPENER_WEIGHT = 1;
const EMPHASIS_WEIGHT = 16;

const BACKTICK = 96;
const ASTERISK = 42;
const UNDERSCORE = 95;
const TILDE = 126;
const BRACKET = 91;
const BANG = 33;
const PAREN = 40;

function workOf(source: string): number {
  let weight = 0;
  for (let i = 0; i < source.length; i++) {
    const code = source.charCodeAt(i);
    if (code === ASTERISK || code === UNDERSCORE || code === TILDE) weight += EMPHASIS_WEIGHT;
    else if (code === BRACKET || code === BANG || code === PAREN || code === BACKTICK) weight += OPENER_WEIGHT;
  }
  return weight * source.length;
}

class BoundedLexer extends Lexer {
  #work = 0;
  /** The cells the tables read so far will draw, summed over the body. */
  tableCells = 0;
  /** Whether the body holds `@[` at all; without it no text is searched for a mention token. */
  hasMentions = false;

  override inlineTokens(source: string, tokens: Token[] = []): Token[] {
    const cost = workOf(source);
    if (this.#work + cost > INLINE_WORK_MAX) {
      tokens.push({ type: 'verbatim', raw: source, text: source });
      return tokens;
    }
    this.#work += cost;
    return super.inlineTokens(source, tokens);
  }
}

/**
 * Marked pads every row of a table to the width of its header, so a header of 500 columns over 9,000 short rows is 4.5 million cells, about a gigabyte, from 20,000 characters, and the tile would draw each one. A table that would have more cells than this is not read as a table. Nor is one past the same count for all the tables of a body, which is as many cells as 20,000 characters can hold unpadded.
 */
const TABLE_CELLS_MAX = 2_000;
const TABLE_CELLS_BODY_MAX = 10_000;

/** How many cells marked finds in a table's header line: a pipe splits it unless an odd number of backslashes come right before it, and a blank first or last cell (the line's own opening or closing pipe) is not a cell. */
function headerCellsIn(line: string): number {
  let splits = 0;
  let first = 0;
  let last = 0;
  let slashes = 0;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '|' && slashes % 2 === 0) {
      if (splits === 0) first = i;
      splits++;
      last = i + 1;
    }
    slashes = char === '\\' ? slashes + 1 : 0;
  }
  let cells = splits + 1;
  if ((splits === 0 ? line : line.slice(0, first)).trim() === '') cells--;
  if (cells > 0 && line.slice(last).trim() === '') cells--;
  return cells;
}

function linesIn(text: string | undefined): number {
  if (!text) return 0;
  let lines = 0;
  for (let at = text.indexOf('\n'); at !== -1; at = text.indexOf('\n', at + 1)) lines++;
  return text.endsWith('\n') ? lines : lines + 1;
}

/** Whether the second line of the text has a pipe or a colon, as a table's delimiter row must. Most blocks do not start a table, and this keeps the table pattern, which reads every row it can, from running at each of them. */
function delimiterMayFollow(source: string): boolean {
  const start = source.indexOf('\n') + 1;
  if (start === 0) return false;
  const end = source.indexOf('\n', start);
  const line = end === -1 ? source.slice(start) : source.slice(start, end);
  return line.includes('|') || line.includes(':');
}

const markdown = new Marked({
  gfm: true,
  breaks: true,
  // The editor's mention token, `@[label](mention:<kind>/<id>)`, is read before marked sees a link in it.
  extensions: [
    {
      name: 'mention',
      level: 'inline',
      start(source: string) {
        if (!(this.lexer as BoundedLexer).hasMentions) return undefined;
        const at = source.indexOf('@[');
        return at === -1 ? undefined : at;
      },
      tokenizer(source: string) {
        const found = scanToken(source);
        // `text` is what an image's alt text keeps of it.
        return found ? { type: 'mention', raw: found.raw, text: `@${found.label}`, ref: found.ref, label: found.label } : undefined;
      },
    },
  ],
  tokenizer: {
    // Returning `undefined` is "not a table here", as it is from marked. Marked reads a table only when its header and its delimiter row have the same number of columns, and then pads every row to that number, which is the count that matters here: the delimiter row cannot hold an escape, so the count from it is exact. A table to leave unread is taken whole, as one paragraph, in this one step: declining it would hand its first line to the paragraph rule, which stops where the next table could start and so reads every remaining line again for each line it takes.
    table(source) {
      if (!delimiterMayFollow(source)) return undefined;
      const match = this.rules.block.table.exec(source);
      if (!match || !this.rules.other.tableDelimiter.test(match[2]!)) return undefined;
      const columns = match[2]!.replace(this.rules.other.tableAlignChars, '').split('|').length;
      if (columns === headerCellsIn(match[1]!)) {
        const lexer = this.lexer as BoundedLexer;
        const cells = columns * (linesIn(match[3]) + 1);
        if (cells <= TABLE_CELLS_MAX && lexer.tableCells + cells <= TABLE_CELLS_BODY_MAX) {
          lexer.tableCells += cells;
          return false;
        }
      }
      const text = match[0].trimEnd();
      // The lexer reads only `raw` from what a tokenizer returns and keeps the token, so this is a table in name only.
      return { type: 'paragraph', raw: match[0], text, tokens: this.lexer.inline(text) } as unknown as Tokens.Table;
    },
  },
});

const isBlank = (char: string | undefined): boolean => char === ' ' || char === '\t';
const isDigit = (char: string | undefined): boolean => char !== undefined && char >= '0' && char <= '9';

/** The index of the character that makes a quote, a bullet or a number of the text at `at`, or -1: the `>`, the bullet, or the `.` or `)` after the digits. */
function containerMark(source: string, at: number, end: number): number {
  if (at >= end) return -1;
  const char = source[at]!;
  if (char === '>') return at;
  if (char === '-' || char === '*' || char === '+') return at + 1 >= end || isBlank(source[at + 1]) ? at : -1;
  if (!isDigit(char)) return -1;
  let digits = at;
  while (digits < end && isDigit(source[digits])) digits++;
  const delimiter = source[digits];
  const closed = digits < end && (delimiter === '.' || delimiter === ')') && (digits + 1 >= end || isBlank(source[digits + 1]));
  return digits - at <= 9 && closed ? digits : -1;
}

/** A line of nothing but one of `-` and `*`, with blanks between. */
function isRule(source: string, start: number, end: number): boolean {
  let bullet = '';
  for (let i = start; i < end; i++) {
    const char = source[i]!;
    if (isBlank(char)) continue;
    if ((char !== '-' && char !== '*') || (bullet && char !== bullet)) return false;
    bullet = char;
  }
  return bullet !== '';
}

/**
 * Where a backslash goes to keep a line's container marks (quote, bullet, number) from nesting past `MAX_DEPTH`, or -1. Marked reads the rest of the line again for each mark, so a line of `- ` repeated takes seconds and a line of `>` repeated overruns its stack, and everything past the limit is text in the tree anyway. A line of bullets and nothing else is a rule, which nests nothing.
 */
function nestedPast(source: string, start: number, end: number): number {
  let at = start;
  for (let depth = 1; ; depth++) {
    while (at < end && isBlank(source[at])) at++;
    const mark = containerMark(source, at, end);
    if (mark === -1) return -1;
    if (depth > MAX_DEPTH) return isRule(source, start, end) ? -1 : mark;
    at = mark + 1;
  }
}

/** The text with a backslash before each container mark `nestedPast` finds, one per line at most. */
function shallow(source: string): string {
  const pieces: string[] = [];
  let copied = 0;
  for (let lineStart = 0; lineStart < source.length; ) {
    const newline = source.indexOf('\n', lineStart);
    const lineEnd = newline === -1 ? source.length : newline;
    const at = nestedPast(source, lineStart, lineEnd);
    if (at !== -1) {
      pieces.push(source.slice(copied, at), '\\');
      copied = at;
    }
    lineStart = lineEnd + 1;
  }
  if (pieces.length === 0) return source;
  pieces.push(source.slice(copied));
  return pieces.join('');
}

/** react-markdown's `defaultUrlTransform`, which the platform's `MarkdownView` runs every URL through. */
const SAFE_SCHEME = /^(https?|ircs?|mailto|xmpp)$/i;

/** A URL with a scheme survives only as http, https, irc, ircs, mailto or xmpp; one without a scheme survives as written. Null otherwise. */
export function safeHref(url: string): string | null {
  const colon = url.indexOf(':');
  const slash = url.indexOf('/');
  const question = url.indexOf('?');
  const hash = url.indexOf('#');
  if (
    colon === -1 ||
    (slash !== -1 && colon > slash) ||
    (question !== -1 && colon > question) ||
    (hash !== -1 && colon > hash) ||
    SAFE_SCHEME.test(url.slice(0, colon))
  ) {
    return url;
  }
  return null;
}

/** Never kept as a link, whatever a page lists: each runs or carries what it names in the page. */
const NEVER_SCHEME = /^(javascript|vbscript|data):/i;

/** A URL `safeHref` keeps, or one that starts with a scheme the page lists, such as `af-mention:`. */
function admit(url: string, schemes: readonly string[]): string | null {
  const safe = safeHref(url);
  if (safe !== null || schemes.length === 0 || NEVER_SCHEME.test(url)) return safe;
  const lower = url.toLowerCase();
  return schemes.some((scheme) => scheme.endsWith(':') && lower.startsWith(scheme.toLowerCase())) ? url : null;
}

/** The longest mention token looked for in text shown as typed: a label of a few hundred characters and its target. */
const TOKEN_MAX = 1_000;

/** Text shown as typed with each mention token in it as `@label`, so no target is drawn. */
function unmention(text: string): string {
  let at = text.indexOf('@[');
  if (at === -1) return text;
  let out = '';
  let from = 0;
  while (at !== -1) {
    const found = scanToken(text.slice(at, at + TOKEN_MAX));
    if (found) {
      out += `${text.slice(from, at)}@${found.label}`;
      from = at + found.raw.length;
      at = text.indexOf('@[', from);
    } else at = text.indexOf('@[', at + 2);
  }
  return out + text.slice(from);
}

const NAMED_REFERENCES = new Map([
  ['amp', '&'], ['lt', '<'], ['gt', '>'], ['quot', '"'], ['apos', "'"], ['nbsp', '\u00a0'], ['copy', '\u00a9'], ['reg', '\u00ae'],
  ['trade', '\u2122'], ['hellip', '\u2026'], ['mdash', '\u2014'], ['ndash', '\u2013'], ['lsquo', '\u2018'], ['rsquo', '\u2019'],
  ['ldquo', '\u201c'], ['rdquo', '\u201d'], ['laquo', '\u00ab'], ['raquo', '\u00bb'], ['middot', '\u00b7'], ['times', '\u00d7'],
  ['deg', '\u00b0'], ['euro', '\u20ac'],
]);
const REFERENCE = /&(?:#(\d{1,7})|#[xX]([0-9a-fA-F]{1,6})|([a-zA-Z]+));/g;

/** The character references the platform's editor writes (`&#x20;`, `&#x31;`) and the few named ones people type, as CommonMark reads them; any other name stays as typed. Only the text of the text tokens goes through this, never code, escapes or raw HTML. */
function decode(text: string): string {
  if (!text.includes('&')) return text;
  return text.replace(REFERENCE, (whole, decimal?: string, hex?: string, name?: string) => {
    if (name !== undefined) return NAMED_REFERENCES.get(name) ?? whole;
    const code = decimal !== undefined ? Number(decimal) : parseInt(hex!, 16);
    return code === 0 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff) ? '\ufffd' : String.fromCodePoint(code);
  });
}

function addText(into: ProseInline[], raw: string): void {
  if (!raw) return;
  const text = unmention(raw);
  const last = into.at(-1);
  if (last?.kind === 'text') last.text += text;
  else into.push({ kind: 'text', text });
}

/** Text as typed, a line break for each newline. */
function verbatimInto(into: ProseInline[], source: string): void {
  for (let from = 0; ; ) {
    const end = source.indexOf('\n', from);
    addText(into, source.slice(from, end === -1 ? undefined : end));
    if (end === -1) return;
    into.push({ kind: 'break' });
    from = end + 1;
  }
}

const rawOf = (tokens: readonly Token[]): string => tokens.map((token) => token.raw).join('');

/** What a run of tokens says with the markup left out: an image's alt text. */
function textOf(tokens: readonly Token[], depth: number): string {
  if (depth > MAX_DEPTH) return rawOf(tokens);
  let text = '';
  for (const token of tokens as readonly Tokens.Generic[]) {
    if (token.type === 'html') text += token.raw;
    else if (token.tokens) text += textOf(token.tokens, depth + 1);
    else if (typeof token.text === 'string') text += token.type === 'text' ? decode(token.text) : token.text;
  }
  return text;
}

function inlinesInto(into: ProseInline[], tokens: readonly Token[], depth: number, inLink: boolean, schemes: readonly string[]): void {
  if (depth > MAX_DEPTH) {
    addText(into, rawOf(tokens));
    return;
  }
  for (const token of tokens) {
    switch (token.type) {
      case 'text': {
        const { text, tokens: children } = token as Tokens.Text;
        if (children) inlinesInto(into, children, depth + 1, inLink, schemes);
        else addText(into, decode(text));
        break;
      }
      case 'verbatim':
        verbatimInto(into, token.raw);
        break;
      case 'escape':
        addText(into, (token as Tokens.Escape).text);
        break;
      case 'br':
        into.push({ kind: 'break' });
        break;
      case 'codespan':
        into.push({ kind: 'code', text: (token as Tokens.Codespan).text });
        break;
      case 'strong':
      case 'em':
      case 'del': {
        const children: ProseInline[] = [];
        inlinesInto(children, (token as Tokens.Strong).tokens, depth + 1, inLink, schemes);
        into.push({ kind: token.type, children });
        break;
      }
      case 'link': {
        const link = token as Tokens.Link;
        const href = admit(decode(link.href), schemes);
        if (href === null || href === '' || inLink) {
          inlinesInto(into, link.tokens, depth + 1, inLink, schemes);
          break;
        }
        const children: ProseInline[] = [];
        inlinesInto(children, link.tokens, depth + 1, true, schemes);
        into.push({ kind: 'link', href, children });
        break;
      }
      case 'image':
        addText(into, textOf((token as Tokens.Image).tokens, depth + 1));
        break;
      case 'mention': {
        const { ref, label } = token as unknown as { ref: string; label: string };
        // A chip is a control, and a link holds none.
        if (inLink) addText(into, `@${label}`);
        else into.push({ kind: 'mention', ref, label });
        break;
      }
      case 'checkbox':
        break;
      default:
        addText(into, token.raw);
    }
  }
}

function inlines(tokens: readonly Token[], depth: number, schemes: readonly string[]): ProseInline[] {
  const runs: ProseInline[] = [];
  inlinesInto(runs, tokens, depth, false, schemes);
  return runs;
}

const LEVELS = [1, 2, 3, 4, 5, 6] as const;

function asText(into: ProseBlock[], raw: string): void {
  const text = unmention(raw.trim());
  if (text) into.push({ kind: 'paragraph', children: [{ kind: 'text', text }] });
}

function blocksInto(into: ProseBlock[], tokens: readonly Token[], depth: number, schemes: readonly string[]): void {
  for (const token of tokens) {
    switch (token.type) {
      case 'space':
      case 'def':
      case 'checkbox':
        break;
      case 'paragraph':
      case 'text': {
        const { tokens: children, text } = token as Tokens.Paragraph;
        const runs: ProseInline[] = [];
        if (children) inlinesInto(runs, children, 0, false, schemes);
        else addText(runs, text);
        if (runs.length) into.push({ kind: 'paragraph', children: runs });
        break;
      }
      case 'heading': {
        const heading = token as Tokens.Heading;
        into.push({ kind: 'heading', level: LEVELS[Math.min(Math.max(heading.depth, 1), 6) - 1]!, children: inlines(heading.tokens, 0, schemes) });
        break;
      }
      case 'code':
        into.push({ kind: 'code', text: (token as Tokens.Code).text });
        break;
      case 'hr':
        into.push({ kind: 'rule' });
        break;
      case 'blockquote': {
        if (depth >= MAX_DEPTH) {
          asText(into, token.raw);
          break;
        }
        const children: ProseBlock[] = [];
        blocksInto(children, (token as Tokens.Blockquote).tokens, depth + 1, schemes);
        into.push({ kind: 'quote', children });
        break;
      }
      case 'list': {
        if (depth >= MAX_DEPTH) {
          asText(into, token.raw);
          break;
        }
        const list = token as Tokens.List;
        into.push({
          kind: 'list',
          ordered: list.ordered,
          start: typeof list.start === 'number' ? list.start : 1,
          items: list.items.map((item) => {
            const children: ProseBlock[] = [];
            blocksInto(children, item.tokens, depth + 1, schemes);
            return { checked: item.task ? item.checked === true : null, children };
          }),
        });
        break;
      }
      case 'table': {
        const table = token as Tokens.Table;
        into.push({
          kind: 'table',
          align: table.align,
          head: table.header.map((cell) => inlines(cell.tokens, 0, schemes)),
          rows: table.rows.map((row) => row.map((cell) => inlines(cell.tokens, 0, schemes))),
        });
        break;
      }
      default:
        asText(into, token.raw);
    }
  }
}

/** Where the part of a body that is read as Markdown ends: at a line end, so no block is cut in two when the body is longer than that. */
function readEnd(body: string): number {
  if (body.length <= LEX_MAX) return body.length;
  const newline = body.lastIndexOf('\n', LEX_MAX);
  return newline > 0 ? newline : LEX_MAX;
}

/**
 * Markdown as the platform's MarkdownView reads it: GFM, a single newline as a break, raw HTML as its own characters, an image as its alt text, and a mention token as a mention. A link is kept when `safeHref` keeps it or its URL starts with one of `schemes` (each ending in `:`). Only the first 20,000 characters are read; the rest is one block of plain text.
 */
export function proseOf(body: string, schemes: readonly string[] = []): ProseBlock[] {
  const end = readEnd(body);
  let tokens: Token[];
  try {
    const lexer = new BoundedLexer(markdown.defaults);
    const read = shallow(body.slice(0, end));
    lexer.hasMentions = read.includes('@[');
    tokens = lexer.lex(read);
  } catch {
    // Marked recurses once for each level it nests, and a browser reports a stack it has used up in its own way: a RangeError in V8, an InternalError in Firefox.
    return [{ kind: 'code', text: body }];
  }
  const blocks: ProseBlock[] = [];
  blocksInto(blocks, tokens, 0, schemes);
  if (end < body.length) {
    // One block of one text node, its line breaks left to `white-space`, so what is not read draws a constant number of elements however long it is.
    const text = body.slice(end).replaceAll('\r\n', '\n').replace(/^\n+/, '').trimEnd();
    if (text) blocks.push({ kind: 'plain', text: unmention(text) });
  }
  return blocks;
}
