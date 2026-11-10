import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../src/kit/index.js';
import { claimEscape } from '../../src/kit/index.js';
import { settle, shadow } from '../support.js';

const CLAIM = Symbol.for('af-kit.escape-claimed');
const claimed = (e: Event) => (e as unknown as Record<symbol, unknown>)[CLAIM];
// Cancelable, as a key press is: a page's layer keeps an Escape for itself by cancelling it.
const escape = (init: KeyboardEventInit = {}) => new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true, cancelable: true, ...init });

type Host = HTMLElement & Record<string, unknown>;
const make = (tag: string, props: Record<string, unknown> = {}, html = '') => {
  const el = document.createElement(tag) as Host;
  Object.assign(el, props);
  el.innerHTML = html;
  return el;
};
const sr = (el: Element, selector: string) => shadow(el).querySelector(selector) as HTMLElement;
const focusInside = (el: Element) => shadow(el).activeElement as HTMLElement;

interface Case {
  tag: string;
  build(): Host;
  // Opens the overlay and returns the node the Escape is pressed on.
  open(el: Host): Promise<HTMLElement>;
  isOpen(el: Host): boolean;
}

// A page closes a controlled overlay on its close request, as AgentFlow does.
const closeOn = (el: Host, type: string) => el.addEventListener(type, () => (el.open = false));

const CASES: Case[] = [
  {
    tag: 'af-menu',
    build: () => make('af-menu', { items: [{ id: 'a', label: 'A' }] }),
    async open(el) {
      sr(el, '[part="trigger"]').click();
      await vi.waitFor(() => expect(focusInside(el)?.closest('[data-scope="menu"][data-part="content"]') ?? null).not.toBeNull());
      return sr(el, '[part="item"]');
    },
    isOpen: (el) => el.dataset.raised === 'true',
  },
  {
    tag: 'af-popover',
    build() {
      const el = make('af-popover', {}, '<button slot="anchor">Lọc</button><div slot="content"><input data-testid="field" /></div>');
      closeOn(el, 'close');
      return el;
    },
    async open(el) {
      el.open = true;
      await settle();
      const field = el.querySelector('[data-testid="field"]') as HTMLElement;
      field.focus();
      return field;
    },
    isOpen: (el) => el.open === true || el.dataset.raised === 'true',
  },
  {
    tag: 'af-tooltip',
    build: () => make('af-tooltip', { text: 'Chỉ quản lý được xoá' }, '<button data-testid="target">Xoá</button>'),
    async open(el) {
      const target = el.querySelector('[data-testid="target"]') as HTMLElement;
      target.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }));
      await settle();
      return target;
    },
    isOpen: (el) => el.dataset.raised === 'true',
  },
  {
    tag: 'af-select',
    build: () => make('af-select', { options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], label: 'Status' }),
    async open(el) {
      sr(el, '[part="trigger"]').click();
      await vi.waitFor(() => expect(el.dataset.raised).toBe('true'));
      return sr(el, '[part="content"]');
    },
    isOpen: (el) => el.dataset.raised === 'true',
  },
  {
    tag: 'af-combobox',
    build: () => make('af-combobox', { options: [{ value: 'dn', label: 'Đà Nẵng' }, { value: 'hn', label: 'Hà Nội' }] }),
    async open(el) {
      const input = sr(el, '[part="input"]');
      input.focus();
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
      await vi.waitFor(() => expect(el.dataset.raised).toBe('true'));
      return input;
    },
    isOpen: (el) => el.dataset.raised === 'true',
  },
  {
    tag: 'af-date',
    build: () => make('af-date', { value: '2026-10-20' }),
    async open(el) {
      sr(el, '[part="trigger"]').click();
      await vi.waitFor(() => expect(focusInside(el)?.closest('[data-scope="date-picker"][data-part="content"]') ?? null).not.toBeNull());
      return focusInside(el);
    },
    isOpen: (el) => el.dataset.raised === 'true',
  },
  {
    tag: 'af-person-picker',
    build: () => make('af-person-picker', { people: [{ id: 'u1', name: 'Nguyễn Văn Bình', email: null }, { id: 'u2', name: 'Trần Thị Hoa', email: null }] }),
    async open(el) {
      const input = sr(el, '[part="input"]');
      input.focus();
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
      await vi.waitFor(() => expect(el.dataset.raised).toBe('true'));
      return input;
    },
    isOpen: (el) => el.dataset.raised === 'true',
  },
  {
    tag: 'af-tree-picker',
    build: () => make('af-tree-picker', { nodes: [{ id: 'hq', parentId: null, label: 'Head office' }, { id: 'dn', parentId: 'hq', label: 'Đà Nẵng' }] }),
    async open(el) {
      const input = sr(el, '[part~="input"]');
      input.focus();
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
      await vi.waitFor(() => expect(el.dataset.raised).toBe('true'));
      return input;
    },
    isOpen: (el) => el.dataset.raised === 'true',
  },
  {
    tag: 'af-dialog',
    build() {
      const el = make('af-dialog', { heading: 'Chi tiết' }, '<input data-testid="field" />');
      closeOn(el, 'close');
      return el;
    },
    async open(el) {
      el.open = true;
      await settle();
      return sr(el, '[part="content"]');
    },
    isOpen: (el) => el.open === true,
  },
  {
    tag: 'af-confirm',
    build() {
      const el = make('af-confirm', { heading: 'Xoá?', message: 'Không hoàn tác được.' });
      closeOn(el, 'cancel');
      return el;
    },
    async open(el) {
      el.open = true;
      await settle();
      return sr(el, '[part="content"]');
    },
    isOpen: (el) => el.open === true,
  },
];

// Combobox-backed pickers, the date field and the tooltip close on an Escape whatever the page did with it, as they did before.
const CLOSES_ON_ANY_ESCAPE = new Set(['af-tooltip', 'af-combobox', 'af-date', 'af-person-picker']);

let removeLayer: (() => void) | null = null;
afterEach(() => {
  removeLayer?.();
  removeLayer = null;
  document.body.innerHTML = '';
});

/** A page's own layer that opened before the overlay: its document capture listener runs first, as Radix's does. */
function pageLayer(handle: (e: KeyboardEvent) => void) {
  const listener = (e: KeyboardEvent) => {
    if (e.key === 'Escape') handle(e);
  };
  document.addEventListener('keydown', listener, { capture: true });
  removeLayer = () => document.removeEventListener('keydown', listener, { capture: true });
}

describe('claimEscape', () => {
  it('claims an Escape for an open overlay inside the given layer', async () => {
    const div = document.createElement('div');
    div.append(make('af-popover', { open: true }, '<button slot="anchor">Lọc</button><div slot="content">Nội dung</div>'));
    document.body.append(div);
    await settle();
    const event = escape();
    expect(claimEscape(event, div)).toBe(true);
    expect(claimed(event)).toBe(true);
  });

  it('does not claim with nothing open, another key, an IME composition, or an overlay outside the layer', async () => {
    const layer = document.createElement('div');
    layer.append(make('af-popover', { open: false }, '<button slot="anchor">Lọc</button><div slot="content">Nội dung</div>'));
    const elsewhere = make('af-popover', { open: true }, '<button slot="anchor">Khác</button><div slot="content">Nội dung</div>');
    document.body.append(layer, elsewhere);
    await settle();
    const cases: [KeyboardEvent, Element | null, Element | null][] = [
      [escape(), layer, null],
      [escape({ key: 'Enter' }), document.body, null],
      [escape({ isComposing: true }), document.body, null],
      [escape(), layer, elsewhere],
    ];
    for (const [event, within] of cases) {
      expect(claimEscape(event, within)).toBe(false);
      expect(claimed(event)).toBeUndefined();
    }
  });

  it('claims for an open af-confirm and af-dialog', async () => {
    for (const tag of ['af-confirm', 'af-dialog']) {
      document.body.innerHTML = '';
      const layer = document.createElement('div');
      const el = make(tag, { heading: 'Xoá?' });
      layer.append(el);
      document.body.append(layer);
      await settle();
      expect(claimEscape(escape(), layer), `${tag} closed`).toBe(false);
      el.open = true;
      await settle();
      expect(el.hasAttribute('data-raised'), tag).toBe(false);
      expect(claimEscape(escape(), layer), tag).toBe(true);
      el.open = false;
      await settle();
    }
  });

  it('finds an open overlay inside an open shadow root under the layer', async () => {
    const layer = document.createElement('div');
    const wrapper = document.createElement('div');
    wrapper.attachShadow({ mode: 'open' }).append(make('af-popover', { open: true }, '<button slot="anchor">Lọc</button><div slot="content">Nội dung</div>'));
    layer.append(wrapper);
    document.body.append(layer);
    await settle();
    expect(claimEscape(escape())).toBe(true);
    expect(claimEscape(escape(), layer)).toBe(true);
  });

  it('claims for a shown tooltip only when the Escape comes from inside it', async () => {
    const layer = document.createElement('div');
    const tip = make('af-tooltip', { text: 'Gợi ý' }, '<button data-testid="target">Xoá</button>');
    const other = document.createElement('button');
    layer.append(tip, other);
    document.body.append(layer);
    await settle();
    const target = tip.querySelector('[data-testid="target"]') as HTMLElement;
    target.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }));
    await settle();
    expect(tip.dataset.raised).toBe('true');
    const results: boolean[] = [];
    pageLayer((e) => results.push(claimEscape(e, layer)));
    other.dispatchEvent(escape());
    target.dispatchEvent(escape());
    expect(results).toEqual([false, true]);
  });

  it.each(CASES.map((c) => [c.tag, c] as const))('%s closes on a claimed Escape that the page cancelled', async (_tag, c) => {
    const el = c.build();
    document.body.append(el);
    await settle();
    pageLayer((e) => {
      claimEscape(e);
      e.preventDefault();
    });
    const target = await c.open(el);
    expect(c.isOpen(el)).toBe(true);
    target.dispatchEvent(escape());
    await settle();
    expect(c.isOpen(el)).toBe(false);
  });

  it.each(CASES.map((c) => [c.tag, c] as const))('a cancelled Escape without the claim leaves %s as it always did', async (tag, c) => {
    const el = c.build();
    document.body.append(el);
    await settle();
    pageLayer((e) => e.preventDefault());
    const target = await c.open(el);
    target.dispatchEvent(escape());
    await settle();
    expect(c.isOpen(el)).toBe(!CLOSES_ON_ANY_ESCAPE.has(tag));
  });

  it('closes with the same events and reasons as an uncancelled Escape', async () => {
    const seen: [string, unknown][] = [];
    const popover = make('af-popover', {}, '<button slot="anchor">Lọc</button><div slot="content"><input /></div>');
    const dialog = make('af-dialog', { heading: 'Chi tiết' });
    const confirm = make('af-confirm', { heading: 'Xoá?' });
    for (const [el, type] of [[popover, 'close'], [dialog, 'close'], [confirm, 'cancel']] as const) {
      el.addEventListener(type, (e) => {
        seen.push([`${el.localName}:${type}`, (e as CustomEvent).detail]);
        el.open = false;
      });
    }
    document.body.append(popover, dialog, confirm);
    await settle();
    pageLayer((e) => {
      if (claimEscape(e)) e.preventDefault();
    });
    for (const el of [popover, dialog, confirm]) {
      el.open = true;
      await settle();
      sr(el, '[part="content"]').dispatchEvent(escape());
      await settle();
    }
    expect(seen).toEqual([
      ['af-popover:close', { reason: 'escape' }],
      ['af-dialog:close', { reason: 'escape' }],
      ['af-confirm:cancel', { reason: 'escape' }],
    ]);
  });

  it('returns focus to the trigger as an uncancelled Escape does', async () => {
    const menu = CASES.find((c) => c.tag === 'af-menu')!;
    const el = menu.build();
    document.body.append(el);
    await settle();
    pageLayer((e) => {
      if (claimEscape(e)) e.preventDefault();
    });
    const target = await menu.open(el);
    target.dispatchEvent(escape());
    await vi.waitFor(() => expect(shadow(el).activeElement).toBe(sr(el, '[part="trigger"]')));
  });

  it('a claimed Escape over a shown tooltip in a popover closes only the tooltip', async () => {
    const el = make('af-popover', {}, '<button slot="anchor">Lọc</button><div slot="content"><af-tooltip text="Thu gọn"><button data-testid="compact">Gọn</button></af-tooltip></div>');
    const seen: unknown[] = [];
    el.addEventListener('close', (e) => {
      seen.push((e as CustomEvent).detail);
      el.open = false;
    });
    document.body.append(el);
    await settle();
    pageLayer((e) => {
      if (claimEscape(e)) e.preventDefault();
    });
    el.open = true;
    await settle();
    const tip = el.querySelector('af-tooltip') as HTMLElement;
    const compact = el.querySelector('[data-testid="compact"]') as HTMLElement;
    compact.focus();
    compact.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }));
    await settle();
    expect(tip.dataset.raised).toBe('true');
    compact.dispatchEvent(escape());
    await settle();
    expect(tip.dataset.raised).toBe('false');
    expect(el.open).toBe(true);
    expect(seen).toEqual([]);
  });

  it("closes the rich editor's mention menu and link popover on a claimed Escape", async () => {
    const el = make('af-rich-editor', {
      mentions: async () => ({ groups: [{ key: 'people', title: 'Người', items: [{ kind: 'user', ref: 'user/u1', label: 'Lê Hoàng Nam' }] }] }),
    }) as Host & { editor: { commands: { focus(): void; insertContent(s: string): void }; view: { dom: HTMLElement } } | null };
    document.body.append(el);
    await vi.waitFor(() => expect(el.editor).not.toBeNull(), { timeout: 5000 });
    await settle();
    pageLayer((e) => {
      if (claimEscape(e)) e.preventDefault();
    });
    el.editor!.commands.focus();
    el.editor!.commands.insertContent('@');
    await vi.waitFor(() => expect(el.dataset.raised).toBe('true'));
    el.editor!.view.dom.dispatchEvent(escape());
    await settle();
    expect(el.dataset.raised).toBe('false');
    sr(el, '[part="tool-link"]').click();
    await vi.waitFor(() => expect(el.dataset.raised).toBe('true'));
    sr(el, '[part="link-input"]').dispatchEvent(escape());
    await settle();
    expect(el.dataset.raised).toBe('false');
  });
});
