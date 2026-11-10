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

  describe('format', () => {
    type Masked = DateEl & { format: string | null; range: boolean; internals: { __validity?: ValidityStateFlags; __message?: string } };
    const masked = (props: Partial<Masked>) => dateEl(props as Partial<DateEl>) as Promise<Masked>;
    const inputOf = (el: HTMLElement) => shadow(el).querySelector('[part="input"]') as HTMLInputElement;
    const heard = (el: HTMLElement) => {
      const seen: unknown[] = [];
      el.addEventListener('change', (e) => seen.push((e as CustomEvent).detail));
      return seen;
    };

    it('shows the value in its format in English and Vietnamese', async () => {
      for (const locale of ['en', 'vi']) {
        const el = await masked({ value: '2026-02-20', locale, format: 'DD.MM.YYYY' });
        expect(inputOf(el).value).toBe('20.02.2026');
        expect(inputOf(el).placeholder).toBe('DD.MM.YYYY');
      }
    });

    it.each([
      ['DD/MM/YYYY', '20/02/2026'],
      ['DD-MM-YYYY', '20-02-2026'],
      ['DD.MM.YYYY', '20.2.2026'],
      ['YYYY-MM-DD', '2026-02-20'],
      ['MM/DD/YYYY', ' 2/20/2026 '],
      ['DD.MM.YYYY', '2026-02-20'],
    ])('commits a date typed in its format (%s: %j)', async (format, typed) => {
      const el = await masked({ value: null, locale: 'en', format });
      const seen = heard(el);
      type(inputOf(el), typed);
      await settle();
      expect(seen).toEqual([{ value: '2026-02-20' }]);
    });

    it('keeps text that does not parse and marks it invalid, until valid text clears the marks', async () => {
      const el = await masked({ value: '2026-02-20', locale: 'vi', format: 'DD/MM/YYYY' });
      const input = inputOf(el);
      const seen = heard(el);
      for (const bad of ['99/99/9999', '31/02/2026', '20/02/26', '20.02.2026']) {
        type(input, bad);
        await settle();
        expect(input.value).toBe(bad);
        expect(input.getAttribute('aria-invalid')).toBe('true');
        expect(el.hasAttribute('data-unparsed')).toBe(true);
      }
      expect(el.value).toBe('2026-02-20');
      expect(seen).toEqual([]);
      expect(el.internals.__validity).toEqual({ badInput: true });
      expect(el.internals.__message).toBe('Nhập ngày theo dạng DD/MM/YYYY.');
      type(input, '21/02/2026');
      await settle();
      expect(seen).toEqual([{ value: '2026-02-21' }]);
      expect(input.hasAttribute('aria-invalid')).toBe(false);
      expect(el.hasAttribute('data-unparsed')).toBe(false);
      expect(el.internals.__validity).toEqual({});
    });

    // A page told of the refusal may hold the text in place of the value, so it hears it, and hears the next commit
    // even when that commit keeps the value it already has.
    it('tells the page the text it refused, and commits the next text that reads even when unchanged', async () => {
      const el = await masked({ value: '2026-02-20', locale: 'vi', format: 'DD/MM/YYYY' });
      const input = inputOf(el);
      const refused: unknown[] = [];
      el.addEventListener('unparsed', (e) => refused.push((e as CustomEvent).detail));
      const seen = heard(el);
      type(input, '31/02/2026');
      blur(input);
      edit(input, '20/02/26');
      blur(input);
      await settle();
      expect(refused).toEqual([{ text: '31/02/2026' }, { text: '20/02/26' }]);
      expect(seen).toEqual([]);
      type(input, '20/02/2026');
      await settle();
      expect(seen).toEqual([{ value: '2026-02-20' }]);
      expect(el.hasAttribute('data-unparsed')).toBe(false);
      type(input, '20/02/2026');
      await settle();
      expect(seen).toEqual([{ value: '2026-02-20' }]);
    });

    it('after a refusal, emptying an empty field is heard', async () => {
      const el = await masked({ value: null, locale: 'en', format: 'DD/MM/YYYY' });
      const seen = heard(el);
      type(inputOf(el), 'not a date');
      edit(inputOf(el), '');
      blur(inputOf(el));
      await settle();
      expect(seen).toEqual([{ value: null }]);
      expect(el.hasAttribute('data-unparsed')).toBe(false);
    });

    // The refusal before it is replaced, so the page hears the value the input shows again.
    it('refuses a typed date outside min and max and shows the value again, unmarked', async () => {
      const el = await masked({ value: '2026-10-20', locale: 'en', format: 'DD/MM/YYYY', min: '2026-10-01', max: '2026-10-31' });
      const seen = heard(el);
      type(inputOf(el), '01/12/2026');
      await settle();
      expect(seen).toEqual([]);
      type(inputOf(el), '99/99/9999');
      type(inputOf(el), '01/12/2026');
      await settle();
      expect(seen).toEqual([{ value: '2026-10-20' }]);
      expect(inputOf(el).value).toBe('20/10/2026');
      expect(el.hasAttribute('data-unparsed')).toBe(false);
    });

    it('an empty input commits an empty value, with or without clearable', async () => {
      for (const clearable of [false, true]) {
        const el = await masked({ value: '2026-02-20', locale: 'en', format: 'DD/MM/YYYY', clearable });
        const seen = heard(el);
        type(inputOf(el), '99/99/9999');
        edit(inputOf(el), '   ');
        blur(inputOf(el));
        await settle();
        expect(seen).toEqual([{ value: null }]);
        expect(el.hasAttribute('data-unparsed')).toBe(false);
      }
    });

    it('opens the calendar on the typed month, else on the value', async () => {
      const el = await masked({ value: '2026-02-20', locale: 'en', format: 'DD/MM/YYYY' });
      const trigger = shadow(el).querySelector('[part="trigger"]') as HTMLElement;
      const focusedDay = () => shadow(el).querySelector('[data-part="table-cell-trigger"][data-view="day"][data-focus]')?.getAttribute('data-value');
      edit(inputOf(el), '7/5/2027');
      trigger.click();
      await settle();
      await vi.waitFor(() => expect(focusedDay()).toBe('2027-05-07'));
      (shadow(el).activeElement as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
      await settle();
      type(inputOf(el), 'not a date');
      trigger.click();
      await settle();
      await vi.waitFor(() => expect(focusedDay()).toBe('2026-02-20'));
    });

    it('a format it cannot read is ignored', async () => {
      const el = await masked({ value: '2026-10-20', locale: 'vi', format: 'D MMM' });
      const input = inputOf(el);
      expect(input.value).toBe('20/10/2026');
      expect(input.placeholder).toBe('dd/mm/yyyy');
      const seen = heard(el);
      type(input, 'không phải ngày');
      expect(input.value).toBe('20/10/2026');
      expect(el.hasAttribute('data-unparsed')).toBe(false);
      edit(input, '');
      blur(input);
      await settle();
      expect(seen).toEqual([]);
    });

    it('is ignored in range mode', async () => {
      const el = await masked({ range: true, locale: 'en', format: 'DD.MM.YYYY', start: '2026-11-01' } as Partial<Masked>);
      const start = shadow(el).querySelector('[part="input start"]') as HTMLInputElement;
      expect(start.value).toBe('1 Nov 2026');
      const seen = heard(el);
      type(start, '05.11.2026');
      expect(start.value).toBe('1 Nov 2026');
      expect(el.hasAttribute('data-unparsed')).toBe(false);
      await settle();
      expect(seen).toEqual([]);
    });
  });

  describe('in a form', () => {
    type Recorded = { __value?: unknown; __validity?: ValidityStateFlags; __message?: string };
    type FormDate = DateEl & { internals: Recorded; formResetCallback(): void };
    const internals = (el: HTMLElement) => (el as FormDate).internals;

    it('submits its value under its name', async () => {
      document.body.innerHTML = '<form><af-date name="due" value="2026-11-05"></af-date></form>';
      await settle();
      expect(internals(document.querySelector('af-date')!).__value).toBe('2026-11-05');
      // The browser submits a string value under the name attribute, so a name set as a property writes it.
      expect((await dateEl({ name: 'due' } as Partial<DateEl>)).getAttribute('name')).toBe('due');
    });

    it('is missing a value when required and empty', async () => {
      const el = await dateEl({ required: true } as Partial<DateEl>);
      expect(internals(el).__validity).toEqual({ valueMissing: true });
      expect(internals(el).__message).toBe('Fill in this field.');
    });

    it('is under its range before min, in words that name the date', async () => {
      const el = await dateEl({ min: '2026-11-10', value: '2026-11-05' });
      expect(internals(el).__validity).toEqual({ rangeUnderflow: true });
      expect(internals(el).__message).toBe('Must be 10 Nov 2026 or later.');
    });

    it('emits its value attribute on reset, and nothing when it already holds it', async () => {
      const el = (await dateEl({})) as FormDate;
      el.setAttribute('value', '2026-11-01');
      el.value = '2026-11-05';
      await settle();
      const seen: unknown[] = [];
      el.addEventListener('change', (e) => seen.push((e as CustomEvent).detail));
      el.formResetCallback();
      expect(seen).toEqual([{ value: '2026-11-01' }]);
      el.value = '2026-11-01';
      await settle();
      el.formResetCallback();
      expect(seen).toHaveLength(1);
    });

    it('describes its input with the description and the error', async () => {
      const el = await dateEl({ description: 'Due by Friday', error: 'Too late' } as Partial<DateEl>);
      const input = shadow(el).querySelector('[part="input"]') as HTMLInputElement;
      const described = shadow(el).getElementById(input.getAttribute('aria-describedby') ?? '');
      expect(described?.hidden).toBe(true);
      expect(described?.textContent).toBe('Due by Friday Too late');
    });

    it('marks its input invalid, required and read-only, and a read-only one opens no calendar', async () => {
      const el = await dateEl({ invalid: true, required: true, readonly: true } as Partial<DateEl>);
      const input = shadow(el).querySelector('[part="input"]') as HTMLInputElement;
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('aria-required')).toBe('true');
      expect(input.readOnly).toBe(true);
      (shadow(el).querySelector('[part="trigger"]') as HTMLElement).click();
      await settle();
      expect(el.dataset.raised).not.toBe('true');
    });
  });

  describe('range', () => {
    type RangeEl = DateEl & {
      range: boolean; start: string | null; end: string | null; name: string | null; label: string | null; required: boolean;
      internals: { __value?: unknown; __validity?: ValidityStateFlags; __message?: string }; formResetCallback(): void;
    };
    async function rangeEl(props: Partial<RangeEl>) {
      return (await dateEl({ range: true, locale: 'vi', ...props } as Partial<DateEl>)) as RangeEl;
    }
    const startOf = (el: HTMLElement) => shadow(el).querySelector('[part="input start"]') as HTMLInputElement;
    const endOf = (el: HTMLElement) => shadow(el).querySelector('[part="input end"]') as HTMLInputElement;
    const heard = (el: HTMLElement) => {
      const seen: unknown[] = [];
      el.addEventListener('change', (e) => seen.push((e as CustomEvent).detail));
      return seen;
    };

    it('renders a start and an end input with a separator between, named Start date and End date, after label when set', async () => {
      const el = await rangeEl({ locale: 'en' });
      expect(startOf(el).getAttribute('aria-label')).toBe('Start date');
      expect(endOf(el).getAttribute('aria-label')).toBe('End date');
      expect(shadow(el).querySelector('[part="input"]')).toBeNull();
      const separator = shadow(el).querySelector('[part="separator"]') as HTMLElement;
      expect(separator.textContent).toBe('–');
      expect(startOf(el).compareDocumentPosition(separator) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(separator.compareDocumentPosition(endOf(el)) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      el.label = 'Due';
      await settle();
      expect(startOf(el).getAttribute('aria-label')).toBe('Due: Start date');
      el.locale = 'vi';
      await settle();
      expect(endOf(el).getAttribute('aria-label')).toBe('Due: Ngày kết thúc');
    });

    it('emits both ends when a start is typed and committed on Enter', async () => {
      const el = await rangeEl({ end: '2026-11-30' });
      expect(endOf(el).value).toBe('30/11/2026');
      const seen = heard(el);
      type(startOf(el), '01/11/2026');
      await settle();
      expect(seen).toEqual([{ start: '2026-11-01', end: '2026-11-30' }]);
    });

    it('refuses an end earlier than the start, and puts the shown end back', async () => {
      const el = await rangeEl({ start: '2026-11-01', end: '2026-11-30' });
      const seen = heard(el);
      type(endOf(el), '01/10/2026');
      await settle();
      expect(seen).toEqual([]);
      expect(endOf(el).value).toBe('30/11/2026');
    });

    it('commits an emptied end on blur as an open end', async () => {
      const el = await rangeEl({ start: '2026-11-01', end: '2026-11-30' });
      const seen = heard(el);
      edit(endOf(el), '');
      blur(endOf(el));
      await settle();
      expect(seen).toEqual([{ start: '2026-11-01', end: null }]);
    });

    it('refuses a typed date outside min and max', async () => {
      const el = await rangeEl({ start: '2026-11-01', min: '2026-10-01', max: '2026-12-31' });
      const seen = heard(el);
      type(endOf(el), '05/01/2027');
      type(startOf(el), '2026-09-30');
      await settle();
      expect(seen).toEqual([]);
      expect(startOf(el).value).toBe('01/11/2026');
      expect(endOf(el).value).toBe('');
    });

    it('emits once, with both ends, when a start and then an end are picked in the calendar', async () => {
      const el = await rangeEl({ start: '2026-10-01', end: '2026-10-05' });
      (shadow(el).querySelector('[part="trigger"]') as HTMLElement).click();
      await settle();
      const seen = heard(el);
      const day = (iso: string) => shadow(el).querySelector(`[data-part="table-cell-trigger"][data-view="day"][data-value="${iso}"]`) as HTMLElement;
      day('2026-10-12').click();
      await settle();
      expect(seen).toEqual([]);
      expect(el.dataset.raised).toBe('true');
      day('2026-10-20').click();
      await settle();
      expect(seen).toEqual([{ start: '2026-10-12', end: '2026-10-20' }]);
      expect(el.dataset.raised).toBe('false');
    });

    it('clears both ends from Clear, even an end the calendar was never handed', async () => {
      const el = await rangeEl({ end: '2026-11-30', clearable: true });
      (shadow(el).querySelector('[part="trigger"]') as HTMLElement).click();
      await settle();
      const seen = heard(el);
      const clear = shadow(el).querySelector('[part="clear"]') as HTMLElement;
      expect(clear.hidden).toBe(false);
      clear.click();
      await settle();
      expect(seen).toEqual([{ start: null, end: null }]);
    });

    it('submits start/end under its name, with an empty side for an open end, and nothing for neither', async () => {
      const el = await rangeEl({ name: 'window', start: '2026-11-01', end: '2026-11-30', value: '2026-01-01' });
      expect(el.internals.__value).toBe('2026-11-01/2026-11-30');
      el.end = null;
      await settle();
      expect(el.internals.__value).toBe('2026-11-01/');
      el.start = null;
      await settle();
      expect(el.internals.__value).toBeNull();
    });

    it('is missing a value when required and both ends are empty', async () => {
      const el = await rangeEl({ required: true, end: '2026-11-30' });
      expect(el.internals.__validity).toEqual({});
      el.end = null;
      await settle();
      expect(el.internals.__validity).toEqual({ valueMissing: true });
    });

    it('emits its start and end attributes on reset, and nothing when it already holds them', async () => {
      const el = await rangeEl({});
      el.setAttribute('start', '2026-11-01');
      el.start = '2026-11-05';
      el.end = '2026-11-30';
      await settle();
      const seen = heard(el);
      el.formResetCallback();
      expect(seen).toEqual([{ start: '2026-11-01', end: null }]);
      el.end = null;
      el.start = '2026-11-01';
      await settle();
      el.formResetCallback();
      expect(seen).toHaveLength(1);
    });
  });
});
