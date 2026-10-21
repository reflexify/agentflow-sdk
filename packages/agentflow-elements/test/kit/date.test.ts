import { describe, expect, it, vi } from 'vitest';
import '../../src/kit/index.js';
import { settle, shadow, watchDocumentKeyListeners } from '../support.js';

type DateEl = HTMLElement & { value: string | null; locale: string; min: string | null; max: string | null; clearable: boolean };

async function dateEl(props: Partial<DateEl>) {
  document.body.innerHTML = '';
  const el = document.createElement('af-date') as DateEl;
  Object.assign(el, props);
  document.body.append(el);
  await settle();
  return el;
}

const edit = (input: HTMLInputElement, text: string) => {
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
};

const blur = (input: HTMLInputElement) => input.dispatchEvent(new FocusEvent('blur'));

const type = (input: HTMLInputElement, text: string) => {
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }));
};

describe('<af-date>', () => {
  it('names its input from label, falling back to the placeholder', async () => {
    const input = (el: HTMLElement) => shadow(el).querySelector('[part="input"]') as HTMLInputElement;
    expect(input(await dateEl({ label: 'Hạn', placeholder: 'Chọn ngày' } as Partial<DateEl>)).getAttribute('aria-label')).toBe('Hạn');
    expect(input(await dateEl({ placeholder: 'Chọn ngày' } as Partial<DateEl>)).getAttribute('aria-label')).toBe('Chọn ngày');
    expect(input(await dateEl({})).hasAttribute('aria-label')).toBe(false);
  });

  it('shows a Vietnamese date and emits ISO on a typed one', async () => {
    const el = await dateEl({ value: '2026-10-20', locale: 'vi' });
    const input = shadow(el).querySelector('[part="input"]') as HTMLInputElement;
    expect(input.value).toBe('20/10/2026');
    const seen: unknown[] = [];
    el.addEventListener('change', (e) => seen.push((e as CustomEvent).detail));
    type(input, '05/11/2026');
    await settle();
    expect(seen).toEqual([{ value: '2026-11-05' }]);
  });

  it('refuses a date outside min and max', async () => {
    const el = await dateEl({ value: null, locale: 'vi', min: '2026-10-01', max: '2026-10-31' });
    const seen: unknown[] = [];
    el.addEventListener('change', (e) => seen.push(e));
    type(shadow(el).querySelector('[part="input"]') as HTMLInputElement, '01/12/2026');
    await settle();
    expect(seen).toHaveLength(0);
  });

  it('clears to null when clearable', async () => {
    const el = await dateEl({ value: '2026-10-20', locale: 'en', clearable: true });
    const seen: unknown[] = [];
    el.addEventListener('change', (e) => seen.push((e as CustomEvent).detail));
    (shadow(el).querySelector('[part="trigger"]') as HTMLElement).click();
    await settle();
    (shadow(el).querySelector('[part="clear"]') as HTMLElement).click();
    await settle();
    expect(seen).toEqual([{ value: null }]);
  });

  it('raises its calendar into the top layer, moves focus into it, and gives focus back on Escape', async () => {
    const el = await dateEl({ value: '2026-10-20', locale: 'vi' });
    const trigger = shadow(el).querySelector('[part="trigger"]') as HTMLElement;
    trigger.click();
    await settle();
    const positioner = shadow(el).querySelector('[data-scope="date-picker"][data-part="positioner"]') as HTMLElement;
    expect(positioner.getAttribute('popover')).toBe('manual');
    expect(el.dataset.raised).toBe('true');
    await vi.waitFor(() => expect(shadow(el).activeElement?.closest('[data-scope="date-picker"][data-part="content"]')).not.toBeNull());
    (shadow(el).activeElement as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
    await settle();
    expect(el.dataset.raised).toBe('false');
    await vi.waitFor(() => expect(shadow(el).activeElement).toBe(trigger));
  });

  it('adds no key listener of its own to document or window, mounted or open', async () => {
    const watch = watchDocumentKeyListeners();
    try {
      const el = await dateEl({ value: null, locale: 'en' });
      (shadow(el).querySelector('[part="trigger"]') as HTMLElement).click();
      await settle();
      expect(watch.fromKit()).toEqual([]);
    } finally {
      watch.restore();
    }
  });

  it('shows an English date as day, short month and year', async () => {
    const el = await dateEl({ value: '2026-10-20', locale: 'en' });
    expect((shadow(el).querySelector('[part="input"]') as HTMLInputElement).value).toBe('20 Oct 2026');
  });

  it('accepts a typed ISO date, and puts the shown date back when the text is not one or is out of range', async () => {
    const el = await dateEl({ value: '2026-10-20', locale: 'vi', min: '2026-10-01', max: '2026-10-31' });
    const input = shadow(el).querySelector('[part="input"]') as HTMLInputElement;
    const seen: unknown[] = [];
    el.addEventListener('change', (e) => seen.push((e as CustomEvent).detail));
    type(input, '2026-10-25');
    type(input, 'không phải ngày');
    expect(input.value).toBe('20/10/2026');
    type(input, '31/02/2026');
    expect(input.value).toBe('20/10/2026');
    type(input, '01/12/2026');
    expect(input.value).toBe('20/10/2026');
    await settle();
    expect(seen).toEqual([{ value: '2026-10-25' }]);
  });

  it('commits typed text on blur and clears on empty text only when clearable', async () => {
    const el = await dateEl({ value: '2026-10-20', locale: 'vi', clearable: true });
    const input = shadow(el).querySelector('[part="input"]') as HTMLInputElement;
    const seen: unknown[] = [];
    el.addEventListener('change', (e) => seen.push((e as CustomEvent).detail));
    edit(input, '03/01/2027');
    blur(input);
    el.value = '2027-01-03';
    await settle();
    edit(input, '');
    blur(input);
    await settle();
    expect(seen).toEqual([{ value: '2027-01-03' }, { value: null }]);
    el.clearable = false;
    el.value = '2026-10-20';
    await settle();
    seen.length = 0;
    edit(input, '');
    blur(input);
    expect(seen).toEqual([]);
    expect(input.value).toBe('20/10/2026');
  });

  it('emits one typed edit once, however it is committed', async () => {
    const el = await dateEl({ value: '2026-10-20', locale: 'vi' });
    const input = shadow(el).querySelector('[part="input"]') as HTMLInputElement;
    const seen: unknown[] = [];
    el.addEventListener('change', (e) => seen.push((e as CustomEvent).detail));
    type(input, '05/11/2026');
    blur(input);
    blur(input);
    await settle();
    expect(seen).toEqual([{ value: '2026-11-05' }]);
  });

  it('ignores text that the user did not type', async () => {
    const el = await dateEl({ value: '2026-10-20', locale: 'vi' });
    const input = shadow(el).querySelector('[part="input"]') as HTMLInputElement;
    const seen: unknown[] = [];
    el.addEventListener('change', (e) => seen.push(e));
    input.value = '05/11/2026';
    blur(input);
    await settle();
    expect(seen).toHaveLength(0);
  });

  it('shows the stored date again when the consumer keeps its value', async () => {
    const el = await dateEl({ value: '2026-10-20', locale: 'vi' });
    const input = shadow(el).querySelector('[part="input"]') as HTMLInputElement;
    const seen: unknown[] = [];
    el.addEventListener('change', (e) => seen.push((e as CustomEvent).detail));
    type(input, '05/11/2026');
    await settle();
    expect(input.value).toBe('20/10/2026');
    blur(input);
    await settle();
    expect(seen).toHaveLength(1);
    expect(input.value).toBe('20/10/2026');
  });

  it('keeps showing a stored date outside min and max, and a bare blur does not rewrite it', async () => {
    const afterwards = async (el: DateEl) => {
      const input = shadow(el).querySelector('[part="input"]') as HTMLInputElement;
      const seen: unknown[] = [];
      el.addEventListener('change', (e) => seen.push(e));
      await settle();
      await new Promise((r) => setTimeout(r, 60));
      await settle();
      blur(input);
      await settle();
      expect(input.value).toBe('30/09/2026');
      expect(seen).toHaveLength(0);
    };
    await afterwards(await dateEl({ value: '2026-09-30', locale: 'vi', min: '2026-10-01' }));
    const el = await dateEl({ value: '2026-09-30', locale: 'vi' });
    el.min = '2026-10-01';
    await afterwards(el);
    const late = await dateEl({ value: null, locale: 'vi', min: '2026-10-01' });
    late.value = '2026-09-15';
    await settle();
    await new Promise((r) => setTimeout(r, 60));
    expect((shadow(late).querySelector('[part="input"]') as HTMLInputElement).value).toBe('15/09/2026');
  });

  it('labels the calendar in the chosen language and lets strings override a label', async () => {
    const el = await dateEl({ value: '2026-10-20', locale: 'vi' });
    const trigger = shadow(el).querySelector('[part="trigger"]') as HTMLElement;
    expect(trigger.getAttribute('aria-label')).toBe('Mở lịch');
    (el as unknown as { strings: unknown }).strings = { openCalendar: 'Chọn ngày' };
    await settle();
    expect(trigger.getAttribute('aria-label')).toBe('Chọn ngày');
    trigger.click();
    await settle();
    const day = shadow(el).querySelector('[data-part="table-cell-trigger"][data-view="day"][data-value="2026-10-22"]') as HTMLElement;
    expect(day.getAttribute('aria-label')).toBe('Chọn Thứ Năm, 22 tháng 10, 2026');
  });

  it('clears a stored date outside min and max, and an in-range one exactly once', async () => {
    for (const [value, expected] of [['2026-09-30', 1], ['2026-10-20', 1]] as const) {
      const el = await dateEl({ value, locale: 'en', clearable: true, min: '2026-10-01' });
      (shadow(el).querySelector('[part="trigger"]') as HTMLElement).click();
      await settle();
      const seen: unknown[] = [];
      el.addEventListener('change', (e) => seen.push((e as CustomEvent).detail));
      const clear = shadow(el).querySelector('[part="clear"]') as HTMLElement;
      expect(clear.hidden).toBe(false);
      clear.click();
      await settle();
      expect(seen).toHaveLength(expected);
      expect(seen).toEqual([{ value: null }]);
    }
  });

  it('moves focus to the input after Clear', async () => {
    const el = await dateEl({ value: '2026-10-20', locale: 'en', clearable: true });
    (shadow(el).querySelector('[part="trigger"]') as HTMLElement).click();
    await settle();
    (shadow(el).querySelector('[part="clear"]') as HTMLElement).click();
    await vi.waitFor(() => expect(shadow(el).activeElement).toBe(shadow(el).querySelector('[part="input"]')));
  });

  it('emits the picked day, closes, and offers no clear button unless clearable', async () => {
    const el = await dateEl({ value: '2026-10-20', locale: 'vi' });
    (shadow(el).querySelector('[part="trigger"]') as HTMLElement).click();
    await settle();
    expect(shadow(el).querySelector('[part="clear"]')).toBeNull();
    const seen: unknown[] = [];
    el.addEventListener('change', (e) => seen.push((e as CustomEvent).detail));
    (shadow(el).querySelector('[data-part="table-cell-trigger"][data-view="day"][data-value="2026-10-22"]') as HTMLElement).click();
    await settle();
    expect(seen).toEqual([{ value: '2026-10-22' }]);
    expect(el.dataset.raised).toBe('false');
  });

  it('cannot pick a day outside min and max', async () => {
    const el = await dateEl({ value: '2026-10-20', locale: 'vi', min: '2026-10-10', max: '2026-10-25' });
    (shadow(el).querySelector('[part="trigger"]') as HTMLElement).click();
    await settle();
    const seen: unknown[] = [];
    el.addEventListener('change', (e) => seen.push(e));
    const early = shadow(el).querySelector('[data-part="table-cell-trigger"][data-view="day"][data-value="2026-10-05"]') as HTMLElement;
    expect(early.hasAttribute('data-disabled')).toBe(true);
    early.click();
    await settle();
    expect(seen).toHaveLength(0);
  });

  it('selects today in the browser zone from the Today button and closes', async () => {
    vi.useFakeTimers({ toFake: ['Date'], now: new Date(2026, 9, 16, 23, 30) });
    try {
      const el = await dateEl({ value: null, locale: 'en' });
      (shadow(el).querySelector('[part="trigger"]') as HTMLElement).click();
      await settle();
      const seen: unknown[] = [];
      el.addEventListener('change', (e) => seen.push((e as CustomEvent).detail));
      (shadow(el).querySelector('[part="today"]') as HTMLElement).click();
      await settle();
      expect(seen).toEqual([{ value: '2026-10-16' }]);
      expect(el.dataset.raised).toBe('false');
    } finally {
      vi.useRealTimers();
    }
  });

  it('disables Today when today is outside min and max, and labels its buttons in the chosen language', async () => {
    const el = await dateEl({ value: null, locale: 'vi', clearable: true, min: '2999-01-01' });
    (shadow(el).querySelector('[part="trigger"]') as HTMLElement).click();
    await settle();
    const today = shadow(el).querySelector('[part="today"]') as HTMLButtonElement;
    expect(today.disabled).toBe(true);
    expect(today.textContent?.trim()).toBe('Hôm nay');
    el.setAttribute('locale', 'en');
    (el as unknown as { strings: unknown }).strings = { today: 'Now' };
    await settle();
    expect((shadow(el).querySelector('[part="today"]') as HTMLElement).textContent?.trim()).toBe('Now');
  });

  it('closes on a click outside it', async () => {
    const el = await dateEl({ value: '2026-10-20', locale: 'vi' });
    const outside = document.createElement('button');
    document.body.append(outside);
    (shadow(el).querySelector('[part="trigger"]') as HTMLElement).click();
    await settle();
    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }));
    outside.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true, button: 0 }));
    outside.click();
    await vi.waitFor(() => expect(el.dataset.raised).toBe('false'), { timeout: 500 });
  });
});
