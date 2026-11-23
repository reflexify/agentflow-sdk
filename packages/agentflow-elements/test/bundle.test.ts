import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';
import { gzipSync } from 'node:zlib';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineActivityFeed } from '../src/activity-feed.js';
import { ELEMENTS_VERSION, defineAgentFlowElements, defineFolderSource } from '../src/index.js';
import { KIT_VERSION } from '../src/kit/version.js';
import pkg from '../package.json';

// A bare specifier is one that starts with neither `.` nor `/`.
const BARE_IMPORTS = [
  /^\s*(?:import|export)\b[^;'"]*\bfrom\s*['"](?![./])/m,
  /^\s*import\s*['"](?![./])/m,
  /\bimport\(\s*['"](?![./])/,
];
// The size guards catch an accident, such as a charting library or the editor coming in by mistake; they are not a
// budget. When a change adds weight on purpose, it re-measures the baseline in the same commit.
// kit.js, raw, measured 877,102 bytes, now that what it shares with the elements bundle (the kit's stylesheet and strings,
// and the folder source) is a chunk beside it; the editor (about 640 KB raw) inlined by mistake trips this.
const KIT_BYTES_MAX = 977_102;
// kit.js and its static chunks, gzipped: what every page loads. Measured 329,072 bytes (320,646 before the comment thread, the editor, the Markdown view, the file picker and the confirmation became chunks the elements bundle loads on demand and kit.js loads with the page, 8,426 bytes, which is each of them gzipped on its own and no longer in kit.js's stream; 318,919 before the activity feed became a chunk of its own, which the elements bundle loads on demand and kit.js loads with the page; 312,175 before the comment thread, 6,744 bytes: its element, its words in both languages, and the relative time and
// file size formats it shares with the feed and the file upload; 303,385 before the activity feed, 8,790 bytes: its
// element and its words for every line it draws, in both languages; 301,420 before the folder source's
// announcements and its words for a refusal, 1,496 bytes, and before it became a chunk of its own, 469 more) with the kit in AgentFlow's look,
// the tile's kinds, the SDK's date and matching helpers, form association, the number input with its locale-aware
// parser, the select's state machine, the combobox and the person picker over one paged source, the date field's range mode, and the field
// and fieldset in place, the form, the scroll area's state machine, which every kit scrollbar is drawn by, the tabs',
// the splitter's, the pager, the dialog's side panel, the menu's groups, headings, checkbox and radio items, its lockable trigger and toned items, the copy button, the Markdown view's element, whose
// parser and drawing load on first use, the empty, error, repeater, drag handle and file chip classes, the table classes, the page structure classes, the view classes, the filter classes, the tree picker with the tree view's state machine, the bulk bar, the file upload with the file upload's state machine, the signature pad with its state machine and perfect-freehand, the popover's focus return and its tooltip's Escape, the list row chosen by aria-current, the Escape a page's own layer hands to an overlay, and the edited field's bar, the fourth column of a section, the success banner and the repeater's line row (`af-repeater-row line`), and the number input's `fractional` and `unscaled` and the file upload's `label` and `replace`, and the date field's `format` with the SDK's date masks, and the number input's refusal of text it cannot group, its input drawn from Ark's props without Ark's key handling, and its `unparsed` event, and the date field's, and the folder source with its strings in both languages, which the elements bundle now shares as a chunk, and the activity feed.
const KIT_EAGER_WEIGHT = 329_072;
const EAGER_GROWTH_MAX = 8_000;
// agentflow-elements.js and its static chunks, gzipped. Measured 61,612 bytes for the eight elements (58,307 before the record comments,
// 3,305 bytes: its element, its reload and merge, its upload and its words; 56,463 before the record activity,
// 1,844 bytes: its element, its time-ordered reload and its words; 56,144 before the comment thread's words, 55,697 before the activity feed's
// words, which share a chunk with the elements' own). The kit elements the elements draw are not in it: the start form's
// folder source loads the first time a folder field appears, the record activity's feed the first time one is drawn, and the record comments'
// thread, with the editor, the Markdown view, the file picker and the confirmation it draws, the first time a thread is drawn.
const ELEMENTS_EAGER_WEIGHT = 61_612;
// The kit tags the elements bundle can register, and what loading each adds, gzipped: the element with the kit's stylesheet
// and strings, and everything it loads in turn. The folder source measured 33,141 bytes (29,889 before the kit's strings grew with the comment
// thread and the activity feed, which share a chunk with it); the activity feed 28,546; the comment thread 31,513, the confirmation 54,024,
// the file picker 48,218, the Markdown view 68,175 (with the parser it loads in turn) and the editor 258,248 (with ProseMirror, which loads when a
// composer or an edit opens).
const LAZY_KIT_TAGS = [
  { tag: 'af-folder-source', chunk: /^FolderSource-.*\.js$/, weight: 33_141 },
  { tag: 'af-activity-feed', chunk: /^ActivityFeed-.*\.js$/, weight: 28_546 },
  { tag: 'af-comment-thread', chunk: /^CommentThread-.*\.js$/, weight: 31_513 },
  { tag: 'af-confirm', chunk: /^Confirm-.*\.js$/, weight: 54_024 },
  { tag: 'af-file-upload', chunk: /^FileUpload-.*\.js$/, weight: 48_218 },
  { tag: 'af-markdown', chunk: /^Markdown-.*\.js$/, weight: 68_175 },
  { tag: 'af-rich-editor', chunk: /^RichEditor-.*\.js$/, weight: 258_248 },
];
const LAZY_KIT_TAG = LAZY_KIT_TAGS[0]!.tag;
const CHAT_GZIP_MAX = 50_000;
const TILE_CHUNK_MAX = 90_000;
// A reference to a sibling chunk: `from "./x.js"` (import or export-from) and `import "./x.js"` load it with the file; `import("./x.js")` loads it on demand.
const STATIC_REFERENCE = /(?:\bfrom\s*|^\s*import\s*)["'](\.[^"']+)["']/gm;
const ANY_REFERENCE = /(?:\bfrom\s*|\bimport\s*\(\s*|^\s*import\s*)["'](\.[^"']+)["']/gm;
const EDITOR_CODE = /ProseMirror|prosemirror/;
// A message only marked's own code holds.
const MARKDOWN_PARSER = /marked\(\): input parameter/;

/** Every file `entry` reaches by `reference`, itself included, each once, leaving out (and not following) the files in `skip`. */
function reach(entry: string, reference: RegExp, skip: ReadonlySet<string> = new Set()): Set<string> {
  const seen = new Set<string>();
  const visit = (file: string) => {
    if (seen.has(file) || skip.has(file)) return;
    seen.add(file);
    for (const match of readFileSync(file, 'utf8').matchAll(reference)) visit(resolve(dirname(file), match[1]!));
  };
  visit(entry);
  return seen;
}
const gzipped = (files: Iterable<string>) => [...files].reduce((sum, file) => sum + gzipSync(readFileSync(file, 'utf8')).length, 0);

/** What every page loads: an entry and the chunks it imports, re-exports or loads for their effects, each once. A chunk the entry only calls `import()` on is not in it. */
function eagerWeight(entry: string): { bytes: number; files: Set<string> } {
  const files = reach(entry, STATIC_REFERENCE);
  return { bytes: gzipped(files), files };
}

/** What a lazy chunk adds: itself and everything it reaches, by import or `import()`, that `eager` does not already hold, each once. */
function lazyWeight(chunk: string, eager: Set<string>): number {
  return gzipped(reach(chunk, ANY_REFERENCE, eager));
}
const hasBareImport = (code: string) => BARE_IMPORTS.some((re) => re.test(code));
// Read from the source, since importing the kit here would register every one of them.
const KIT_TAG_NAMES = [...readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../src/kit/index.ts'), 'utf8').matchAll(/^  '(af-[a-z-]+)': /gm)].map((m) => m[1]!);
const TAGS = ['agentflow-provider', 'agentflow-task', 'agentflow-task-inbox', 'agentflow-task-detail', 'agentflow-record-table', 'agentflow-start-form', 'agentflow-record-activity', 'agentflow-record-comments'];

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
  it('registers no kit tag until the folder source is asked for, stamps it as the kit does, and leaves a copy the page registered first', async () => {
    expect(KIT_TAG_NAMES).toContain(LAZY_KIT_TAG);
    for (const tag of KIT_TAG_NAMES) expect(customElements.get(tag), tag).toBeUndefined();
    await defineFolderSource();
    for (const tag of KIT_TAG_NAMES) expect(customElements.get(tag) !== undefined, tag).toBe(tag === LAZY_KIT_TAG);
    const ours = customElements.get(LAZY_KIT_TAG);
    expect((ours as unknown as { kitVersion: string }).kitVersion).toBe(KIT_VERSION);
    await defineFolderSource();
    expect(customElements.get(LAZY_KIT_TAG)).toBe(ours);

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const define = vi.fn();
    const theirs = { current: Object.assign(class extends HTMLElement {}, { kitVersion: '99.0.0' }) as CustomElementConstructor };
    const registry = { get: (tag: string) => (tag === LAZY_KIT_TAG ? theirs.current : customElements.get(tag)), define } as unknown as CustomElementRegistry;
    await defineFolderSource(registry);
    expect(warn).not.toHaveBeenCalled();
    theirs.current = Object.assign(class extends HTMLElement {}, { kitVersion: '0.0.9' });
    // Every start form with a folder field asks, and the page is told once.
    await defineFolderSource(registry);
    await defineFolderSource(registry);
    expect(define).not.toHaveBeenCalled();
    expect(warn.mock.calls).toEqual([
      ['An older copy of the AgentFlow UI kit registered af-folder-source first; this page uses it, not this copy.', { tag: LAZY_KIT_TAG, registered: '0.0.9', loaded: KIT_VERSION }],
    ]);
  });
  it('defines the activity feed on demand as it does the folder source, stamped as the kit stamps it', async () => {
    expect(customElements.get('af-activity-feed')).toBeUndefined();
    await defineActivityFeed();
    expect((customElements.get('af-activity-feed') as unknown as { kitVersion: string }).kitVersion).toBe(KIT_VERSION);
    const ours = customElements.get('af-activity-feed');
    await defineActivityFeed();
    expect(customElements.get('af-activity-feed')).toBe(ours);
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
  it.skipIf(!existsSync(bundle))('the elements bundle loads the folder source, the activity feed and the comment thread with what it draws on demand, holds no other kit tag, and grows at most 8 KB gzipped over its measured size', () => {
    const { bytes, files } = eagerWeight(bundle);
    const held = (among: Iterable<string>) => {
      const code = [...among].map((file) => readFileSync(file, 'utf8')).join('\n');
      return KIT_TAG_NAMES.filter((tag) => new RegExp(`["'\`]${tag}["'\`]`).test(code));
    };
    const lazyTags = LAZY_KIT_TAGS.map((l) => l.tag).sort();
    // The tags' names are in what every page loads, since the elements draw them; the elements are not.
    expect(held(files).sort()).toEqual(lazyTags);
    expect(bytes - ELEMENTS_EAGER_WEIGHT).toBeLessThanOrEqual(EAGER_GROWTH_MAX);

    const dir = resolve(dirname(bundle), 'chunks');
    // The escape entry the editor and the confirmation share with the kit names the hosts that close on Escape, and registers nothing.
    const everything = reach(bundle, ANY_REFERENCE);
    expect(held([...everything].filter((file) => !file.endsWith(`${sep}escape.js`))).sort()).toEqual(lazyTags);
    for (const { tag, chunk: name, weight } of LAZY_KIT_TAGS) {
      const found = readdirSync(dir).filter((file) => name.test(file));
      expect(found, `${tag} loads as one chunk named for it`).toHaveLength(1);
      const chunk = resolve(dir, found[0]!);
      expect(files.has(chunk), `${tag} not with what every page loads`).toBe(false);
      expect(everything.has(chunk), `${tag} reached by import()`).toBe(true);
      const lazy = lazyWeight(chunk, files);
      expect(lazy, tag).toBeGreaterThan(10_000);
      expect(lazy - weight, tag).toBeLessThanOrEqual(EAGER_GROWTH_MAX);
    }
  });

  const chatBundle = resolve(dirname(fileURLToPath(import.meta.url)), '../dist/chat.js');
  it.skipIf(!existsSync(chatBundle))('chat.js is one classic script that loads nothing else, and stays under 50 KB gzipped', () => {
    const code = readFileSync(chatBundle, 'utf8');
    expect(() => new Script(code, { filename: chatBundle }), 'an import or export statement does not compile as a classic script').not.toThrow();
    expect(code).not.toMatch(/\bimport\s*\(/);
    expect(code).toContain('agentflow-chat');
    expect(gzipSync(code).length).toBeLessThanOrEqual(CHAT_GZIP_MAX);
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
  const escapeBundle = resolve(dirname(fileURLToPath(import.meta.url)), '../dist/escape.js');
  it.skipIf(!existsSync(escapeBundle))('the escape entry registers nothing and stays small', async () => {
    const define = vi.spyOn(customElements, 'define');
    const loaded = (await import(/* @vite-ignore */ escapeBundle)) as { claimEscape?: unknown };
    expect(typeof loaded.claimEscape).toBe('function');
    expect(define).not.toHaveBeenCalled();
    const files = reach(escapeBundle, ANY_REFERENCE);
    expect([...files].reduce((sum, file) => sum + statSync(file).size, 0)).toBeLessThan(2_000);
  });
  it.skipIf(!existsSync(kitBundle))('kit.js stays small', () => {
    expect(statSync(kitBundle).size).toBeLessThan(KIT_BYTES_MAX);
  });
  it.skipIf(!existsSync(kitBundle))("what every page loads grows at most 8 KB gzipped over its measured size", () => {
    expect(eagerWeight(kitBundle).bytes - KIT_EAGER_WEIGHT).toBeLessThanOrEqual(EAGER_GROWTH_MAX);
  });
  const tileChunk = () => {
    const dir = resolve(dirname(kitBundle), 'chunks');
    const found = readdirSync(dir).filter((name) => /^tile-view-.*\.js$/.test(name));
    expect(found, 'the tile loads as one chunk named for its view').toHaveLength(1);
    return resolve(dir, found[0]!);
  };
  it.skipIf(!existsSync(kitBundle))("the tile's drawing chunk stays under 90 KB gzipped", () => {
    expect(lazyWeight(tileChunk(), eagerWeight(kitBundle).files)).toBeLessThanOrEqual(TILE_CHUNK_MAX);
  });
  it.skipIf(!existsSync(kitBundle))("the tile's drawing chunk holds no editor", () => {
    for (const file of reach(tileChunk(), ANY_REFERENCE)) expect(readFileSync(file, 'utf8'), file).not.toMatch(EDITOR_CODE);
  });
  const markdownChunk = () => {
    const dir = resolve(dirname(kitBundle), 'chunks');
    const found = readdirSync(dir).filter((name) => /^markdown-view-.*\.js$/.test(name));
    expect(found, 'the Markdown view loads as one chunk named for its view').toHaveLength(1);
    return resolve(dir, found[0]!);
  };
  it.skipIf(!existsSync(kitBundle))('the markdown chunk holds no editor', () => {
    for (const file of reach(markdownChunk(), ANY_REFERENCE)) expect(readFileSync(file, 'utf8'), file).not.toMatch(EDITOR_CODE);
  });
  it.skipIf(!existsSync(kitBundle))('the Markdown parser is reached only by import(), never with what every page loads', () => {
    const eager = eagerWeight(kitBundle).files;
    expect(eager.has(markdownChunk())).toBe(false);
    expect([...reach(markdownChunk(), ANY_REFERENCE)].some((file) => MARKDOWN_PARSER.test(readFileSync(file, 'utf8'))), 'the view reaches the parser').toBe(true);
    for (const file of eager) expect(readFileSync(file, 'utf8'), file).not.toMatch(MARKDOWN_PARSER);
  });
});
