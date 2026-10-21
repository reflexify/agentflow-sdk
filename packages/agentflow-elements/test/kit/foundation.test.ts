import { afterEach, describe, expect, it, vi } from 'vitest';
import { KIT_CSS, KIT_TAGS, KIT_VERSION, defineKitElements } from '../../src/kit/index.js';
import { kitText } from '../../src/kit/text.js';
import pkg from '../../package.json';
import { emit, raise } from '../../src/kit/environment.js';

afterEach(() => vi.restoreAllMocks());

describe('the kit', () => {
  it('registers its nine tags once', () => {
    expect([...KIT_TAGS]).toEqual(['af-dialog', 'af-confirm', 'af-menu', 'af-popover', 'af-tooltip', 'af-toast', 'af-date', 'af-person-picker', 'af-rich-editor']);
    const before = KIT_TAGS.map((t) => customElements.get(t));
    expect(() => defineKitElements()).not.toThrow();
    KIT_TAGS.forEach((t, i) => expect(customElements.get(t), t).toBe(before[i]));
    KIT_TAGS.forEach((t) => expect(customElements.get(t), t).toBeDefined());
  });

  it('registers into a registry it is given', () => {
    const defined: string[] = [];
    const registry = { get: () => undefined, define: (tag: string) => defined.push(tag) } as unknown as CustomElementRegistry;
    defineKitElements(registry);
    expect(defined).toEqual([...KIT_TAGS]);
  });

  it('stamps the package version on every element class', () => {
    expect(KIT_VERSION).toBe(pkg.version);
    for (const tag of KIT_TAGS) expect((customElements.get(tag) as unknown as { kitVersion: string }).kitVersion, tag).toBe(KIT_VERSION);
  });

  it('warns once for each tag an older kit registered first, and stays quiet for its own or a newer one', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const older = Object.assign(class extends HTMLElement {}, { kitVersion: '0.0.9' });
    const unversioned = class extends HTMLElement {};
    const newer = Object.assign(class extends HTMLElement {}, { kitVersion: '99.0.0' });
    const theirs: Record<string, CustomElementConstructor> = { 'af-menu': older, 'af-date': unversioned, 'af-dialog': newer };
    const registry = { get: (tag: string) => theirs[tag] ?? customElements.get(tag), define: () => {} } as unknown as CustomElementRegistry;
    defineKitElements(registry);
    expect(warn.mock.calls.map((c) => (c[1] as { tag: string }).tag)).toEqual(['af-menu', 'af-date']);
    expect(warn.mock.calls[0]![1]).toEqual({ tag: 'af-menu', registered: '0.0.9', loaded: KIT_VERSION });
  });

  it('registers each tag on its own, skipping one another module defined first', () => {
    const defined: string[] = [];
    const theirs = class extends HTMLElement {};
    const registry = { get: (tag: string) => (tag === 'af-menu' ? theirs : undefined), define: (tag: string) => defined.push(tag) } as unknown as CustomElementRegistry;
    defineKitElements(registry);
    expect(defined).toEqual(KIT_TAGS.filter((t) => t !== 'af-menu'));
  });

  it('styles through tokens with fallbacks and never on :host or the page', () => {
    for (const cls of ['.af-button', '.af-button.primary', '.af-button.secondary', '.af-button.danger', '.af-button.ghost', '.af-chip', '.af-avatar', '.af-tabs', '.af-skeleton', '.af-banner']) {
      expect(KIT_CSS, cls).toContain(cls);
    }
    expect(KIT_CSS).not.toMatch(/(^|[\s,}]):root\b|(^|[\s,}])html\b|(^|[\s,}])body\b/);
    expect(KIT_CSS).not.toMatch(/:host\s*\{[^}]*--/);
    for (const use of KIT_CSS.matchAll(/var\((--af-[a-z-]+)\s*([,)])/g)) expect(use[2], use[1]).toBe(',');
    expect(KIT_CSS).toContain('[aria-disabled="true"]');
  });

  it('speaks Vietnamese for vi and vi-VN, English otherwise, and takes overrides', () => {
    expect(kitText('vi').close).toBe('Đóng');
    expect(kitText('vi-VN').cancel).toBe('Huỷ');
    expect(kitText('en-GB').confirm).toBe('Confirm');
    expect(kitText(null).today).toBe('Today');
    expect(kitText('vi', { today: 'Bữa nay' }).today).toBe('Bữa nay');
  });

  it('emits a bubbling, uncomposed event with plain detail', () => {
    const el = document.createElement('div');
    const seen: Event[] = [];
    document.body.append(el);
    document.body.addEventListener('change', (e) => seen.push(e));
    emit(el, 'change', { value: 1 });
    expect(seen).toHaveLength(1);
    expect((seen[0] as CustomEvent).detail).toEqual({ value: 1 });
    expect(seen[0]!.composed).toBe(false);
  });

  it('raises and lowers a popover, and tolerates none', () => {
    const host = document.createElement('div');
    const el = document.createElement('div');
    el.setAttribute('popover', 'manual');
    host.append(el);
    document.body.append(host);
    raise(el, true, host);
    expect(host.dataset.raised).toBe('true');
    expect(el.dataset.raised).toBeUndefined();
    raise(el, false, host);
    expect(host.dataset.raised).toBe('false');
    expect(() => raise(null, true, host)).not.toThrow();
  });
});
