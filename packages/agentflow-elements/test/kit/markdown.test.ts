import { afterEach, describe, expect, it } from 'vitest';
import '../../src/kit/index.js';
import type { ResolvedMention } from '../../src/kit/index.js';
import { draw } from './fixtures/markdown-element.js';

// A mention token names its target as `<kind>/<uuid>`; anything else is not a token.
const ID = '0b6c1f4e-1a2b-4c3d-8e9f-0123456789ab';
const LAN = `user/${ID}`;

afterEach(() => {
  document.body.innerHTML = '';
});

describe('af-markdown', () => {
  it('reads a single newline as a line break in one paragraph', async () => {
    const { body } = await draw({ value: 'a\nb' });
    expect(body.querySelectorAll('p')).toHaveLength(1);
    expect(body.querySelectorAll('p > br')).toHaveLength(1);
  });

  it('keeps a link only for a safe scheme or one the page lists, and asks the page before it opens', async () => {
    expect((await draw({ value: '[x](javascript:alert(1))' })).body.querySelector('a')).toBeNull();
    expect((await draw({ value: '[r](af-mention:u1)' })).body.querySelector('a')).toBeNull();

    const { el, root, body } = await draw({ value: '[r](af-mention:u1)', schemes: ['af-mention:'] });
    const link = body.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('af-mention:u1');
    expect(link.getAttribute('rel')).toBe('noreferrer noopener');
    const heard: { detail: unknown; bubbles: boolean; composed: boolean; cancelable: boolean }[] = [];
    root.addEventListener('af-link', (e) => {
      heard.push({ detail: (e as CustomEvent).detail, bubbles: e.bubbles, composed: e.composed, cancelable: e.cancelable });
      e.preventDefault();
    });
    const click = new MouseEvent('click', { bubbles: true, cancelable: true, composed: true });
    link.dispatchEvent(click);
    expect(heard).toEqual([{ detail: { href: 'af-mention:u1' }, bubbles: true, composed: false, cancelable: true }]);
    expect(click.defaultPrevented).toBe(true);
    expect(el.isConnected).toBe(true);
  });

  it('asks the page before a middle-click opens a link in a new tab', async () => {
    const { root, body } = await draw({ value: '[r](af-mention:u1)', schemes: ['af-mention:'] });
    const heard: unknown[] = [];
    root.addEventListener('af-link', (e) => {
      heard.push((e as CustomEvent).detail);
      e.preventDefault();
    });
    const middle = new MouseEvent('auxclick', { bubbles: true, cancelable: true, composed: true, button: 1 });
    body.querySelector('a')!.dispatchEvent(middle);
    expect(heard).toEqual([{ href: 'af-mention:u1' }]);
    expect(middle.defaultPrevented).toBe(true);
    // Another button's auxclick opens nothing, so it asks nothing.
    body.querySelector('a')!.dispatchEvent(new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 2 }));
    expect(heard).toHaveLength(1);
  });

  it('lets a link open when the page does not stop it', async () => {
    const { body } = await draw({ value: '[docs](https://example.com)' });
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    body.querySelector('a')!.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(false);
  });

  it('draws a mention token as a chip from the map, and never its ref', async () => {
    const ok: ResolvedMention = { state: 'ok', kind: 'user', id: ID, label: 'Trần Lan' };
    const resolved = await draw({ value: `Hỏi @[Lan](mention:${LAN}) nhé`, mentions: { [LAN]: ok } });
    expect(resolved.body.querySelector('.af-mention')?.textContent).toContain('Trần Lan');

    const restricted = await draw({ value: `@[Lan](mention:${LAN})`, mentions: { [LAN]: { state: 'restricted', kind: 'user' } } });
    expect(restricted.body.querySelector('.af-mention')?.textContent).toBe('Restricted person');

    const unknown = await draw({ value: `@[Lan](mention:${LAN})`, mentions: {} });
    const chip = unknown.body.querySelector('.af-mention')!;
    expect(chip.textContent).toContain('Lan');
    expect(chip.getAttribute('data-state')).toBe('unresolved');
    expect(unknown.body.textContent).not.toContain(ID);

    const heard: unknown[] = [];
    unknown.root.addEventListener('af-link', (e) => heard.push((e as CustomEvent).detail));
    chip.closest('button')!.click();
    expect(heard).toEqual([{ href: `mention:${LAN}` }]);
  });

  it('draws a chip again when the page sets its map after the view has drawn', async () => {
    const { el, body } = await draw({ value: `@[Lan](mention:${LAN})`, mentions: null });
    expect(body.querySelector('.af-mention-label')?.textContent).toBe('Lan');
    el.mentions = { [LAN]: { state: 'ok', kind: 'user', id: ID, label: 'Trần Lan' } };
    await expect.poll(() => body.querySelector('.af-mention-label')?.textContent).toBe('Trần Lan');
  });

  it('shows a token past the part read as Markdown as its label, not its target', async () => {
    const { body } = await draw({ value: `${'x\n'.repeat(10_001)}Hỏi @[Lan](mention:${LAN})` });
    expect(body.textContent).toContain('Hỏi @Lan');
    expect(body.textContent).not.toContain(ID);
  });

  it('draws 20,000 characters of unclosed emphasis in bounded time', async () => {
    const started = performance.now();
    const { body } = await draw({ value: '*a '.repeat(6667).slice(0, 20_000) });
    expect(performance.now() - started).toBeLessThan(500);
    expect(body.textContent).toContain('*a');
  });
});
