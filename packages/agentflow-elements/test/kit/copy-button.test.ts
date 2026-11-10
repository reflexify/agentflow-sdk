import { flushSync } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../src/kit/index.js';
import { shadow } from '../support.js';

type CopyElement = HTMLElement & Record<string, unknown>;

// Under fake timers only the time a test advances passes, so the two seconds of the check never run out while the page settles.
async function settle(ms = 0) {
  await vi.advanceTimersByTimeAsync(ms);
  for (let i = 0; i < 5; i++) {
    await vi.advanceTimersByTimeAsync(0);
    flushSync();
  }
}

function deferred() {
  let resolve!: () => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

function clipboard(writeText?: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { value: writeText ? { writeText } : undefined, configurable: true });
}

async function copyButton(props: Record<string, unknown> = {}) {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  document.body.innerHTML = '';
  const el = document.createElement('af-copy-button') as CopyElement;
  Object.assign(el, props);
  document.body.append(el);
  await settle();
  const heard: unknown[] = [];
  el.addEventListener('af-copy', (e) => heard.push((e as CustomEvent).detail));
  return { el, heard };
}

const part = (el: Element, name: string) => shadow(el).querySelector<HTMLElement>(`[part~="${name}"]`)!;
const status = (el: Element) => part(el, 'status').textContent;
const check = (el: Element) => part(el, 'trigger').querySelector('rect') === null;

async function press(el: Element) {
  part(el, 'trigger').click();
  await settle();
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  Reflect.deleteProperty(navigator, 'clipboard');
});

describe('<af-copy-button>', () => {
  it.each([
    ['en', {}, 'Copy'],
    ['vi', {}, 'Sao chép'],
    ['en', { label: 'Copy the invoice number' }, 'Copy the invoice number'],
  ])('in %s with %j, the button is named %s', async (locale, extra, name) => {
    const { el } = await copyButton({ value: 'INV-0042', locale, ...extra });
    expect(part(el, 'trigger').getAttribute('aria-label')).toBe(name);
  });

  it('reads its value and label from attributes, and has its status in the tree before any press', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    document.body.innerHTML = '<af-copy-button value="INV-0042" label="Copy invoice number" locale="en"></af-copy-button>';
    await settle();
    const el = document.querySelector('af-copy-button')!;
    expect(part(el, 'trigger').getAttribute('aria-label')).toBe('Copy invoice number');
    expect(part(el, 'status').getAttribute('role')).toBe('status');
    expect(status(el)).toBe('');
  });

  it.each([
    ['en', 'Copied'],
    ['vi', 'Đã sao chép'],
  ])('copies its value, says so in %s, and clears two seconds later', async (locale, copied) => {
    const writeText = vi.fn(async () => {});
    clipboard(writeText);
    const { el, heard } = await copyButton({ value: 'INV-0042', locale });
    expect(check(el)).toBe(false);
    await press(el);
    expect(writeText).toHaveBeenCalledExactlyOnceWith('INV-0042');
    expect(heard).toEqual([{ value: 'INV-0042', ok: true }]);
    expect(status(el)).toBe(copied);
    expect(check(el)).toBe(true);
    // The name is the same after the press, so a screen reader's focus stays on a button it knows.
    expect(part(el, 'trigger').getAttribute('aria-label')).toBe(locale === 'vi' ? 'Sao chép' : 'Copy');

    await settle(1900);
    expect(status(el)).toBe(copied);
    await settle(100);
    expect(status(el)).toBe('');
    expect(check(el)).toBe(false);
  });

  it('restarts the two seconds when pressed again inside them', async () => {
    clipboard(async () => {});
    const { el, heard } = await copyButton({ value: 'a' });
    await press(el);
    await settle(1500);
    await press(el);
    await settle(1500);
    expect(status(el)).toBe('Copied');
    await settle(500);
    expect(status(el)).toBe('');
    expect(heard).toHaveLength(2);
  });

  it('falls back to a selected textarea when the clipboard refuses, and keeps the textarea and its native copy event inside', async () => {
    clipboard(async () => { throw new DOMException('denied', 'NotAllowedError'); });
    const { el, heard } = await copyButton({ value: 'INV-0042' });
    part(el, 'trigger').focus();
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    const seen: { value: string; selected: string; parent: ParentNode | null }[] = [];
    const exec = vi.spyOn(document, 'execCommand').mockImplementation(() => {
      const area = shadow(el).querySelector('textarea')!;
      seen.push({ value: area.value, selected: area.value.slice(area.selectionStart, area.selectionEnd), parent: area.parentNode });
      // A browser raises its own copy event on the selection, and that one is composed.
      area.dispatchEvent(new Event('copy', { bubbles: true, composed: true }));
      return true;
    });
    const native: Event[] = [];
    const stop = new AbortController();
    el.addEventListener('copy', (e) => native.push(e), { signal: stop.signal });
    document.addEventListener('copy', (e) => native.push(e), { signal: stop.signal });
    await press(el);
    expect(exec).toHaveBeenCalledExactlyOnceWith('copy');
    expect(seen).toEqual([{ value: 'INV-0042', selected: 'INV-0042', parent: shadow(el) }]);
    expect(shadow(el).querySelector('textarea')).toBeNull();
    expect(heard).toEqual([{ value: 'INV-0042', ok: true }]);
    stop.abort();
    expect(native).toEqual([]);
    expect(status(el)).toBe('Copied');
    expect(shadow(el).activeElement).toBe(part(el, 'trigger'));
    // The textarea takes focus without scrolling the page to a box that is fixed in place.
    const onArea = focus.mock.contexts.findIndex((context) => context instanceof HTMLTextAreaElement);
    expect(focus.mock.calls[onArea]).toEqual([{ preventScroll: true }]);
  });

  it('leaves focus on the page control that had it when the click did not focus the button', async () => {
    clipboard();
    vi.spyOn(document, 'execCommand').mockReturnValue(true);
    const { el } = await copyButton({ value: 'x' });
    const input = document.body.appendChild(document.createElement('input'));
    input.focus();
    await press(el);
    expect(document.activeElement).toBe(input);
  });

  it('puts focus on the button when nothing had it', async () => {
    clipboard();
    vi.spyOn(document, 'execCommand').mockReturnValue(true);
    const { el } = await copyButton({ value: 'x' });
    expect(document.activeElement).toBe(document.body);
    await press(el);
    expect(shadow(el).activeElement).toBe(part(el, 'trigger'));
  });

  it('goes straight to the textarea when there is no clipboard', async () => {
    clipboard();
    const exec = vi.spyOn(document, 'execCommand').mockReturnValue(true);
    const { el, heard } = await copyButton({ value: 'x' });
    await press(el);
    expect(exec).toHaveBeenCalledOnce();
    expect(heard).toEqual([{ value: 'x', ok: true }]);
  });

  it.each([
    ['returns false', () => false],
    ['throws', () => { throw new Error('not allowed'); }],
  ])('reports a failure when the clipboard refuses and the textarea copy %s', async (_name, result) => {
    clipboard(async () => { throw new Error('denied'); });
    vi.spyOn(document, 'execCommand').mockImplementation(result);
    const { el, heard } = await copyButton({ value: 'INV-0042' });
    await press(el);
    expect(heard).toEqual([{ value: 'INV-0042', ok: false }]);
    expect(status(el)).toBe("Couldn't copy");
    expect(check(el)).toBe(false);
    expect(shadow(el).querySelector('textarea')).toBeNull();

    await settle(2000);
    expect(status(el)).toBe('');
  });

  it.each([[undefined], ['']])('treats a value of %j as a failed copy and writes nothing', async (value) => {
    const writeText = vi.fn(async () => {});
    clipboard(writeText);
    const exec = vi.spyOn(document, 'execCommand').mockReturnValue(true);
    const { el, heard } = await copyButton(value === undefined ? {} : { value });
    await press(el);
    expect(writeText).not.toHaveBeenCalled();
    expect(exec).not.toHaveBeenCalled();
    expect(heard).toEqual([{ value: '', ok: false }]);
    expect(status(el)).toBe("Couldn't copy");
    expect(check(el)).toBe(false);
  });

  it('shows the outcome of the latest press when an earlier one settles after it, and still reports both', async () => {
    const first = deferred();
    const second = deferred();
    const writes = [first, second];
    clipboard(() => writes.shift()!.promise);
    vi.spyOn(document, 'execCommand').mockReturnValue(false);
    const { el, heard } = await copyButton({ value: 'x' });
    await press(el);
    await press(el);
    second.resolve();
    await settle();
    expect(status(el)).toBe('Copied');
    await settle(1000);
    first.reject(new Error('denied'));
    await settle();
    expect(heard).toEqual([{ value: 'x', ok: true }, { value: 'x', ok: false }]);
    expect(status(el)).toBe('Copied');
    expect(check(el)).toBe(true);
    // The late failure neither replaced the outcome nor moved its two seconds.
    await settle(1000);
    expect(status(el)).toBe('');
  });

  it('says it in Vietnamese when it fails', async () => {
    clipboard();
    vi.spyOn(document, 'execCommand').mockReturnValue(false);
    const { el } = await copyButton({ value: 'x', locale: 'vi' });
    await press(el);
    expect(status(el)).toBe('Không sao chép được');
  });

  it('drops its timer when it leaves the page', async () => {
    clipboard(async () => {});
    const { el } = await copyButton({ value: 'x' });
    await press(el);
    expect(vi.getTimerCount()).toBe(1);
    el.remove();
    await settle();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('arms no timer for an outcome that arrives after it left the page', async () => {
    const write = deferred();
    clipboard(() => write.promise);
    const { el } = await copyButton({ value: 'x' });
    await press(el);
    el.remove();
    await settle();
    write.resolve();
    await settle();
    expect(vi.getTimerCount()).toBe(0);
  });
});
