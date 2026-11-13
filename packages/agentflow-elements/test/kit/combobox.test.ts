import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import type { PickerPage, PickerQuery, PickerSource } from '@reflexify/agentflow-sdk';
import '../../src/kit/index.js';
import type { ComboboxOption } from '../../src/kit/index.js';
import { flushSync } from 'svelte';
import { settle as settleReal, shadow, watchDocumentKeyListeners } from '../support.js';

const CITIES: ComboboxOption[] = [
  { value: 'dn', label: 'Đà Nẵng', description: 'Miền Trung' },
  { value: 'hn', label: 'Hà Nội', description: 'Thủ đô' },
  { value: 'hue', label: 'Huế', disabled: true, reason: 'Chưa mở chi nhánh' },
];
type ComboEl = HTMLElement & { options: unknown; source: unknown; value: unknown; multiple: boolean };

async function combobox(props: Record<string, unknown>) {
  document.body.innerHTML = '';
  const el = document.createElement('af-combobox') as ComboEl;
  Object.assign(el, props);
  document.body.append(el);
  await settle();
  return el;
}
const input = (el: HTMLElement) => shadow(el).querySelector('[part="input"]') as HTMLInputElement;
async function typeInto(el: HTMLElement, text: string) {
  input(el).focus();
  input(el).value = text;
  input(el).dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  await settle();
}
const options = (el: HTMLElement) => [...shadow(el).querySelectorAll('[part="option"]')].map((o) => o.textContent?.trim() ?? '');
const heard = (el: HTMLElement, type = 'change') => {
  const seen: unknown[] = [];
  el.addEventListener(type, (e) => seen.push((e as CustomEvent).detail));
  return seen;
};

/** A promise the test settles by hand, so it decides the order answers arrive in. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}
const page = (labels: string[], next: string | null = null): PickerPage<ComboboxOption> => ({
  items: labels.map((label) => ({ value: label.toLowerCase().replace(/\s+/g, '-'), label })),
  next,
});
/** A source whose every call waits for the test; `calls` holds each query and the answer it is waiting on. */
function handSource(resolve?: PickerSource<ComboboxOption>['resolve']) {
  const calls: { query: PickerQuery; answer: ReturnType<typeof deferred<PickerPage<ComboboxOption>>> }[] = [];
  const source = vi.fn((query: PickerQuery) => {
    const answer = deferred<PickerPage<ComboboxOption>>();
    calls.push({ query, answer });
    return answer.promise;
  }) as unknown as PickerSource<ComboboxOption> & ReturnType<typeof vi.fn>;
  if (resolve) source.resolve = resolve;
  return { source, calls };
}

afterEach(() => vi.useRealTimers());

// Under fake timers only the time a test advances passes, so the 250 ms wait never runs out while the page settles.
const useFakeTimers = () => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
async function settle() {
  if (!vi.isFakeTimers()) return settleReal();
  for (let i = 0; i < 20; i++) {
    await vi.advanceTimersByTimeAsync(0);
    flushSync();
  }
}

describe('<af-combobox>', () => {
  it('filters its options without accents, by label and description, and emits search', async () => {
    const el = await combobox({ options: CITIES, value: null });
    const searches = heard(el, 'search');
    await typeInto(el, 'da');
    expect(options(el)).toEqual([expect.stringContaining('Đà Nẵng')]);
    expect(searches.at(-1)).toEqual({ query: 'da' });
    await typeInto(el, 'thu do');
    expect(options(el)).toEqual([expect.stringContaining('Hà Nội')]);
  });

  it('calls its source once, 250 ms after typing stops', async () => {
    useFakeTimers();
    const { source, calls } = handSource();
    const el = await combobox({ source, value: null });
    await typeInto(el, 'ng');
    await vi.advanceTimersByTimeAsync(100);
    await typeInto(el, 'ngu');
    expect(source).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(250);
    await settle();
    expect(source).toHaveBeenCalledTimes(1);
    expect(calls[0]!.query).toMatchObject({ q: 'ngu', cursor: null });
    expect(calls[0]!.query.signal).toBeInstanceOf(AbortSignal);
  });

  it('calls its source at once when the list opens', async () => {
    const { source, calls } = handSource();
    const el = await combobox({ source, value: null });
    input(el).focus();
    input(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
    await settle();
    expect(calls.map((c) => c.query.q)).toEqual(['']);
    expect(shadow(el).querySelector('[part="loading"]')?.textContent).toBe('Loading…');
    calls[0]!.answer.resolve(page(['Nguyễn Huệ']));
    await settle();
    expect(shadow(el).querySelector('[part="loading"]')).toBeNull();
    expect(options(el)).toEqual(['Nguyễn Huệ']);
  });

  it('shows loading, not "No matches", while typing waits to ask the source', async () => {
    useFakeTimers();
    const { source, calls } = handSource();
    const el = await combobox({ source, value: null, locale: 'en' });
    await typeInto(el, 'ng');
    await vi.advanceTimersByTimeAsync(100);
    await settle();
    expect(calls).toEqual([]);
    expect(shadow(el).querySelector('[part="loading"]')?.textContent).toBe('Loading…');
    expect(shadow(el).querySelector('[part="empty"]')).toBeNull();
  });

  it('shows an unnamed value as an ellipsis, not unknown, while typing waits to ask the source', async () => {
    useFakeTimers();
    const { source } = handSource(async () => []);
    const el = await combobox({ source, value: ['x1'], multiple: true, locale: 'en' });
    const chip = () => shadow(el).querySelector('[part="chip"]')?.textContent ?? '';
    expect(chip()).toContain('Unknown value');
    await typeInto(el, 'ng');
    expect(chip()).toContain('…');
    expect(chip()).not.toContain('Unknown value');
  });

  it('aborts the earlier call and drops its answer when answers arrive out of order', async () => {
    useFakeTimers();
    const { source, calls } = handSource();
    const el = await combobox({ source, value: null });
    await typeInto(el, 'ng');
    await vi.advanceTimersByTimeAsync(250);
    await typeInto(el, 'ngu');
    await vi.advanceTimersByTimeAsync(250);
    await settle();
    expect(calls.map((c) => c.query.q)).toEqual(['ng', 'ngu']);
    expect(calls[0]!.query.signal.aborted).toBe(true);
    expect(calls[1]!.query.signal.aborted).toBe(false);
    calls[1]!.answer.resolve(page(['Nguyễn Trãi']));
    await settle();
    calls[0]!.answer.resolve(page(['Ngô Quyền']));
    await settle();
    expect(options(el)).toEqual(['Nguyễn Trãi']);
  });

  it('offers load more while next is set, and appends the next page', async () => {
    const { source, calls } = handSource();
    const el = await combobox({ source, value: null });
    input(el).focus();
    input(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
    await settle();
    calls[0]!.answer.resolve(page(['An Giang', 'Bạc Liêu'], 'c2'));
    await settle();
    const more = shadow(el).querySelector('[part="load-more"]') as HTMLButtonElement;
    expect(more.textContent?.trim()).toBe('Load more');
    more.click();
    await settle();
    expect(calls[1]!.query).toMatchObject({ q: '', cursor: 'c2' });
    calls[1]!.answer.resolve(page(['Cà Mau'], null));
    await settle();
    expect(options(el)).toEqual(['An Giang', 'Bạc Liêu', 'Cà Mau']);
    expect(shadow(el).querySelector('[part="load-more"]')).toBeNull();
  });

  it('asks resolve once for a value no page has named, and never shows the raw id', async () => {
    const answer = deferred<ComboboxOption[]>();
    const resolve = vi.fn(() => answer.promise);
    const { source } = handSource(resolve);
    const el = await combobox({ source, value: 'x9', locale: 'en' });
    expect(resolve).toHaveBeenCalledTimes(1);
    expect((resolve.mock.calls[0] as unknown[])[0]).toEqual(['x9']);
    expect(input(el).value).toBe('…');
    answer.resolve([{ value: 'x9', label: 'Kho Bắc' }]);
    await settle();
    expect(input(el).value).toBe('Kho Bắc');
    el.value = null;
    await settle();
    el.value = 'x9';
    await settle();
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(input(el).value).toBe('Kho Bắc');
  });

  it('calls a value resolve cannot name unknown, numbered when there are several', async () => {
    const { source } = handSource(async () => []);
    const one = await combobox({ source, value: 'x9', locale: 'en' });
    expect(input(one).value).toBe('Unknown value');
    const many = await combobox({ source, value: ['x1', 'x2'], multiple: true, locale: 'vi' });
    const chips = [...shadow(many).querySelectorAll('[part="chip"]')].map((c) => c.textContent?.trim() ?? '');
    expect(chips).toEqual([expect.stringContaining('Giá trị không xác định 1'), expect.stringContaining('Giá trị không xác định 2')]);
    expect(chips.join(' ')).not.toContain('x1');
  });

  it('keeps the name of a chosen value after the list moves on', async () => {
    useFakeTimers();
    const { source, calls } = handSource();
    const el = await combobox({ source, value: [], multiple: true });
    el.addEventListener('change', (e) => (el.value = (e as CustomEvent<{ value: unknown }>).detail.value));
    await typeInto(el, 'an');
    await vi.advanceTimersByTimeAsync(250);
    calls[0]!.answer.resolve(page(['An Giang']));
    await settle();
    (shadow(el).querySelector('[part="option"]') as HTMLElement).click();
    await settle();
    await typeInto(el, 'ca');
    await vi.advanceTimersByTimeAsync(250);
    calls[1]!.answer.resolve(page(['Cà Mau']));
    await settle();
    expect(options(el)).toEqual(['Cà Mau']);
    expect(shadow(el).querySelector('[part="chip"]')?.textContent).toContain('An Giang');
  });

  it('restarts the list for a new source', async () => {
    const first = handSource();
    const el = await combobox({ source: first.source, value: null });
    input(el).focus();
    input(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
    await settle();
    first.calls[0]!.answer.resolve(page(['An Giang']));
    await settle();
    const second = handSource();
    el.source = second.source;
    await settle();
    expect(options(el)).toEqual([]);
    expect(second.calls.map((c) => c.query)).toMatchObject([{ q: '', cursor: null }]);
    second.calls[0]!.answer.resolve(page(['Bến Tre']));
    await settle();
    expect(options(el)).toEqual(['Bến Tre']);
  });

  it('draws a chip for each value, and a chip’s remove emits the value without it', async () => {
    const el = await combobox({ options: CITIES, value: ['dn', 'hn'], multiple: true });
    const chips = [...shadow(el).querySelectorAll('[part="chip"]')].map((c) => c.textContent?.trim() ?? '');
    expect(chips).toEqual([expect.stringContaining('Đà Nẵng'), expect.stringContaining('Hà Nội')]);
    expect(shadow(el).querySelector('[part="chip"] .af-avatar')).toBeNull();
    const seen = heard(el);
    (shadow(el).querySelectorAll('[part="remove"]')[0] as HTMLElement).click();
    await settle();
    expect(seen).toEqual([{ value: ['hn'] }]);
  });

  it('focuses its input, not a chip’s remove, from a press on a chip or from its field’s label, as af-person-picker does', async () => {
    for (const [tag, props] of [
      ['af-combobox', { options: CITIES, value: ['dn', 'hn'] }],
      ['af-person-picker', { people: [{ id: 'u1', name: 'Bình' }], value: ['u1'] }],
    ] as const) {
      document.body.innerHTML = `<af-field label="Who"><${tag} multiple></${tag}></af-field>`;
      const el = document.querySelector(tag) as ComboEl;
      Object.assign(el, props);
      await settle();
      const text = shadow(el).querySelector('[part="chip"] span:not(.af-avatar)') as HTMLElement;
      const press = new MouseEvent('mousedown', { bubbles: true, composed: true, cancelable: true });
      text.dispatchEvent(press);
      expect(press.defaultPrevented, tag).toBe(true);
      expect(shadow(el).activeElement, tag).toBe(input(el));
      input(el).blur();
      const onRemove = new MouseEvent('mousedown', { bubbles: true, composed: true, cancelable: true });
      shadow(el).querySelector('[part="remove"]')!.dispatchEvent(onRemove);
      expect(onRemove.defaultPrevented, 'a press on remove is the button’s').toBe(false);
      document.querySelector<HTMLElement>('.af-field-label')!.click();
      expect(shadow(el).activeElement, tag).toBe(input(el));
    }
  });

  describe('a quick press outside while the list is open', () => {
    const PICKERS = [
      ['af-combobox', { options: CITIES, value: [] }, 'ha noi'],
      ['af-person-picker', { people: [{ id: 'u1', name: 'Bình' }, { id: 'u2', name: 'Hoa' }], value: [] }, 'binh'],
    ] as const;
    // Zag judges a press outside in the frame after it. jsdom runs a frame's callbacks in one task; here each gets its own.
    const framesAsTasks = () => {
      vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => setTimeout(() => fn(performance.now()), 0));
      vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
      onTestFinished(() => { vi.unstubAllGlobals(); });
    };
    const twoFrames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    async function openAfterPick(tag: string, props: object, query: string) {
      document.body.innerHTML = `<af-field label="Who"><${tag} multiple></${tag}></af-field><p>elsewhere</p>`;
      const el = document.querySelector(tag) as ComboEl;
      Object.assign(el, props);
      el.addEventListener('change', (e) => (el.value = (e as CustomEvent<{ value: string[] }>).detail.value));
      await settle();
      await typeInto(el, query);
      (shadow(el).querySelector('[part="option"]') as HTMLElement).click();
      await settle();
      expect(el.dataset.raised, tag).toBe('true');
      return el;
    }
    // The press, the release and the click inside one frame, as a script or a fast hand makes them.
    function quickClick(target: HTMLElement, between?: () => void) {
      target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0, pointerType: 'mouse' }));
      between?.();
      target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true, button: 0, pointerType: 'mouse' }));
      target.click();
    }

    it('on its field’s label keeps the first key typed after it, as the label gives focus back to the input', async () => {
      framesAsTasks();
      for (const [tag, props, query] of PICKERS) {
        const el = await openAfterPick(tag, props, query);
        // A press on a label takes focus off the input, as a browser's mousedown does; the label's click gives it back.
        quickClick(document.querySelector<HTMLElement>('.af-field-label')!, () => input(el).blur());
        expect(shadow(el).activeElement, tag).toBe(input(el));
        input(el).value = 'h';
        input(el).dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        await twoFrames();
        await settle();
        expect(input(el).value, tag).toBe('h');
        expect(el.dataset.raised, tag).toBe('true');
      }
    });

    it('elsewhere closes the list even when focus stays in the input, as a tap on iOS leaves it', async () => {
      framesAsTasks();
      for (const [tag, props, query] of PICKERS) {
        const el = await openAfterPick(tag, props, query);
        quickClick(document.querySelector('p')!);
        expect(shadow(el).activeElement, tag).toBe(input(el));
        await twoFrames();
        await settle();
        expect(el.dataset.raised, tag).not.toBe('true');
      }
    });
  });

  it('picks an option, and shows it once the page sets it back', async () => {
    const el = await combobox({ options: CITIES, value: null });
    const seen = heard(el);
    await typeInto(el, 'ha');
    (shadow(el).querySelector('[part="option"]') as HTMLElement).click();
    await settle();
    expect(seen).toEqual([{ value: 'hn' }]);
    el.value = 'hn';
    await settle();
    expect(input(el).value).toBe('Hà Nội');
  });

  it('keeps what the person types after a pick when the page sets the value back late', async () => {
    const el = await combobox({ options: CITIES, value: [], multiple: true });
    const seen = heard(el);
    await typeInto(el, 'da');
    (shadow(el).querySelector('[part="option"]') as HTMLElement).click();
    await settle();
    expect(input(el).value).toBe('');
    await typeInto(el, 'ha');
    el.value = (seen[0] as { value: string[] }).value;
    await settle();
    expect(input(el).value).toBe('ha');
    expect(options(el)).toEqual([expect.stringContaining('Hà Nội')]);
  });

  it('never picks a disabled option, and carries its reason as the option’s description', async () => {
    const el = await combobox({ options: CITIES, value: null });
    const seen = heard(el);
    await typeInto(el, 'hue');
    const hue = shadow(el).querySelector('[part="option"]') as HTMLElement;
    expect(hue.getAttribute('aria-description')).toBe('Chưa mở chi nhánh');
    expect((hue.closest('af-tooltip') as unknown as { text: string }).text).toBe('Chưa mở chi nhánh');
    hue.click();
    await settle();
    expect(seen).toEqual([]);
  });

  it('says it is read-only to assistive technology', async () => {
    const el = await combobox({ options: CITIES, value: null, readonly: true });
    expect(input(el).readOnly).toBe(true);
  });

  it('adds no key listener of its own to document or window, mounted or open', async () => {
    const watch = watchDocumentKeyListeners();
    try {
      const el = await combobox({ options: CITIES, value: null });
      await typeInto(el, 'h');
      expect(watch.fromKit()).toEqual([]);
    } finally {
      watch.restore();
    }
  });

  describe('in a form', () => {
    type Recorded = { __value?: unknown; __validity?: ValidityStateFlags };
    type FormCombo = ComboEl & { internals: Recorded; formResetCallback(): void };

    it('records each value under its name', async () => {
      const el = (await combobox({ options: CITIES, multiple: true, name: 'cities', value: ['dn', 'hn'] })) as FormCombo;
      expect([...(el.internals.__value as FormData)]).toEqual([['cities', 'dn'], ['cities', 'hn']]);
    });

    it('is missing a value when required and empty', async () => {
      const el = (await combobox({ options: CITIES, multiple: true, required: true, value: [] })) as FormCombo;
      expect(el.internals.__validity).toEqual({ valueMissing: true });
    });

    it('emits its default on reset', async () => {
      const el = (await combobox({ options: CITIES, multiple: true, value: ['dn'] })) as FormCombo;
      const seen = heard(el);
      el.formResetCallback();
      expect(seen).toEqual([{ value: [] }]);
    });
  });
});
