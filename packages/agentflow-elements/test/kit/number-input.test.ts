import { describe, expect, it } from 'vitest';
import '../../src/kit/index.js';
import { settle, shadow } from '../support.js';

type NumberEl = HTMLElement & {
  value: number | null; min: number | null; max: number | null; step: number; precision: number | null;
  format: string; currency: string; steppers: boolean; locale: string; name: string; required: boolean;
  fractional: boolean; unscaled: boolean; separators: string;
};
type Recorded = { __value?: unknown; __validity?: ValidityStateFlags; __message?: string };
const internals = (el: HTMLElement) => (el as unknown as { internals: Recorded }).internals;

async function numberEl(props: Partial<NumberEl>) {
  document.body.innerHTML = '';
  const el = document.createElement('af-number-input') as NumberEl;
  Object.assign(el, { locale: 'vi', ...props });
  document.body.append(el);
  await settle();
  return el;
}

const inputOf = (el: HTMLElement) => shadow(el).querySelector('[part="input"]') as HTMLInputElement;
const listen = (el: HTMLElement) => {
  const seen: unknown[] = [];
  el.addEventListener('change', (e) => seen.push((e as CustomEvent).detail));
  return seen;
};
const edit = (input: HTMLInputElement, text: string) => {
  input.focus();
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
};
const key = (input: HTMLInputElement, k: string) => input.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, composed: true, cancelable: true }));
// Intl separates a currency or a percent sign with a no-break space, narrow in some locales.
const spaced = (text: string) => text.replace(/[  ]/g, ' ');

describe('<af-number-input>', () => {
  it('keeps typed text until Enter commits it, then shows the value the page sets back', async () => {
    const el = await numberEl({ precision: 2 });
    const input = inputOf(el);
    const seen = listen(el);
    edit(input, '1234,5');
    await settle();
    expect(seen).toEqual([]);
    expect(input.value).toBe('1234,5');
    key(input, 'Enter');
    await settle();
    expect(seen).toEqual([{ value: 1234.5 }]);
    el.value = 1234.5;
    await settle();
    expect(input.value).toBe('1.234,5');
  });

  it('reads English separators and commits on blur', async () => {
    const el = await numberEl({ locale: 'en', precision: 2 });
    const input = inputOf(el);
    const seen = listen(el);
    edit(input, '1,234.5');
    input.blur();
    await settle();
    expect(seen).toEqual([{ value: 1234.5 }]);
  });

  it('commits null when the text is cleared, and drops text that is no number', async () => {
    const el = await numberEl({ value: 7 });
    const input = inputOf(el);
    const seen = listen(el);
    edit(input, '');
    input.blur();
    await settle();
    expect(seen).toEqual([{ value: null }]);
    edit(input, 'bảy');
    input.blur();
    await settle();
    expect(seen).toHaveLength(1);
    expect(input.value).toBe('7');
  });

  // A Vietnamese person typing an English decimal point would otherwise have it read as a group separator, "1234.5" as
  // 12345: text whose grouping does not read in the element's language is refused, as a masked date refuses its text.
  describe('refuses text whose grouping does not read in its language', () => {
    it.each([
      ['vi', '1234.5'],
      ['vi', '12.50'],
      ['vi', '0.125'],
      ['vi', '1.23.456'],
      ['vi', '1,234.5'],
      ['vi', '12,345.67'],
      ['vi', '1,2.345'],
      ['vi', '1.234,5.6'],
      ['en', '1,5'],
      ['en', '01,234'],
      ['en', '1.234,5'],
      ['en', '1.2.3'],
    ])('in %s, %s', async (locale, typed) => {
      const el = await numberEl({ locale, value: 7, fractional: true });
      const input = inputOf(el);
      const seen = listen(el);
      edit(input, typed);
      key(input, 'Enter');
      await settle();
      expect(seen).toEqual([]);
      expect(input.value).toBe(typed);
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(el.hasAttribute('data-unparsed')).toBe(true);
      expect(internals(el).__validity).toEqual({ badInput: true });
      expect(internals(el).__message).toBe(locale === 'vi' ? 'Nhập số theo dạng 1.234,5.' : 'Enter a number as 1,234.5.');
      input.blur();
      await settle();
      expect(seen).toEqual([]);
      expect(input.value).toBe(typed);
    });

    it.each([
      ['vi', '1.234,5', 1234.5],
      ['vi', '1234,5', 1234.5],
      ['vi', '1.234', 1234],
      ['vi', '12.345.678', 12345678],
      ['en', '1,234.5', 1234.5],
      ['en', '1234.5', 1234.5],
      ['en', '1,234', 1234],
    ])('but reads, in %s, %s as %s', async (locale, typed, expected) => {
      const el = await numberEl({ locale, fractional: true });
      const input = inputOf(el);
      const seen = listen(el);
      edit(input, typed);
      key(input, 'Enter');
      await settle();
      expect(seen).toEqual([{ value: expected }]);
      expect(el.hasAttribute('data-unparsed')).toBe(false);
      expect(internals(el).__validity).toEqual({});
    });

    // The refusal keeps Ark from hearing the commit, not the page: a wrapper's own focusout and key listeners still
    // hear the field.
    it('lets the page hear the Enter and the focusout of refused text', async () => {
      const el = await numberEl({ value: 7, fractional: true });
      const input = inputOf(el);
      const heard: string[] = [];
      el.addEventListener('keydown', (e) => heard.push(`keydown ${(e as KeyboardEvent).key}`));
      el.addEventListener('focusout', () => heard.push('focusout'));
      edit(input, '1234.5');
      key(input, 'Enter');
      input.blur();
      await settle();
      expect(el.hasAttribute('data-unparsed')).toBe(true);
      expect(input.value).toBe('1234.5');
      expect(heard).toEqual(['keydown Enter', 'focusout']);
    });

    it('lets the page hear Home and End, which move the caret', async () => {
      const el = await numberEl({ value: 7, min: 0, max: 10 });
      const input = inputOf(el);
      const heard: string[] = [];
      el.addEventListener('keydown', (e) => heard.push((e as KeyboardEvent).key));
      const seen = listen(el);
      input.focus();
      key(input, 'Home');
      key(input, 'End');
      await settle();
      expect(heard).toEqual(['Home', 'End']);
      expect(seen).toEqual([]);
      expect(input.value).toBe('7');
    });

    // A page told of the refusal may hold the text in place of the value, so it hears it, and hears the next commit
    // even when that commit is the value it already has.
    it('tells the page the text it refused, and commits the next text that reads even when unchanged', async () => {
      const el = await numberEl({ value: 7, fractional: true });
      const input = inputOf(el);
      const heard: unknown[] = [];
      el.addEventListener('unparsed', (e) => heard.push((e as CustomEvent).detail));
      const seen = listen(el);
      edit(input, '1234.5');
      key(input, 'Enter');
      await settle();
      edit(input, '12.50');
      input.blur();
      await settle();
      expect(heard).toEqual([{ text: '1234.5' }, { text: '12.50' }]);
      expect(seen).toEqual([]);
      edit(input, '7');
      key(input, 'Enter');
      await settle();
      expect(seen).toEqual([{ value: 7 }]);
      expect(el.hasAttribute('data-unparsed')).toBe(false);
      edit(input, '7');
      key(input, 'Enter');
      await settle();
      expect(seen).toEqual([{ value: 7 }]);
      // Text that is no number after a refusal is dropped, and the page hears the value shown again.
      edit(input, '1234.5');
      key(input, 'Enter');
      edit(input, 'bảy');
      input.blur();
      await settle();
      expect(seen).toEqual([{ value: 7 }, { value: 7 }]);
      expect(el.hasAttribute('data-unparsed')).toBe(false);
    });

    it('clears the mark on text that reads, and on a new value', async () => {
      const el = await numberEl({ value: 7, fractional: true });
      const input = inputOf(el);
      const seen = listen(el);
      edit(input, '1234.5');
      key(input, 'Enter');
      await settle();
      expect(el.hasAttribute('data-unparsed')).toBe(true);
      edit(input, '1234,5');
      key(input, 'Enter');
      await settle();
      expect(seen).toEqual([{ value: 1234.5 }]);
      expect(el.hasAttribute('data-unparsed')).toBe(false);
      expect(input.getAttribute('aria-invalid')).toBeNull();

      edit(input, '12.50');
      input.blur();
      await settle();
      expect(el.hasAttribute('data-unparsed')).toBe(true);
      el.value = 3;
      await settle();
      expect(el.hasAttribute('data-unparsed')).toBe(false);
      expect(internals(el).__validity).toEqual({});
      expect(input.value).toBe('3');
    });
  });

  // A field written with its own separators edits in them, whatever the element's language.
  describe('separators', () => {
    it.each([
      // [locale, separators, typed, committed (null = refused)]
      ['en', 'dot_comma', '1.234,5', 1234.5],
      ['en', 'dot_comma', '1,234.5', null],
      ['vi', 'comma_dot', '1,234.5', 1234.5],
      ['vi', 'comma_dot', '1.234,5', null],
      ['en', 'space_comma', '1 234,5', 1234.5],
      ['en', 'space_comma', '1\u00a0234,5', 1234.5],
      ['en', 'space_comma', '1\u202f234,5', 1234.5],
      ['en', 'space_comma', '12 34,5', null],
      ['vi', 'space_comma', '1.234', null],
      ['en', 'space_comma', '1.234,5', null],
      ['en', 'space_comma', '1,5', 1.5],
      ['vi', 'none', '1234,5', 1234.5],
      ['vi', 'none', '1.234,5', null],
      ['vi', 'locale', '1.234,5', 1234.5],
    ])('in %s with %s, %j', async (locale, separators, typed, committed) => {
      const el = await numberEl({ locale, value: 7, fractional: true, separators });
      const input = inputOf(el);
      const seen = listen(el);
      edit(input, typed);
      key(input, 'Enter');
      await settle();
      expect(seen).toEqual(committed === null ? [] : [{ value: committed }]);
      expect(el.hasAttribute('data-unparsed')).toBe(committed === null);
    });

    it('shows the value in the preset', async () => {
      expect(inputOf(await numberEl({ locale: 'en', separators: 'dot_comma', value: 1234.5, fractional: true })).value).toBe('1.234,5');
      expect(inputOf(await numberEl({ locale: 'vi', separators: 'comma_dot', value: 1234.5, fractional: true })).value).toBe('1,234.5');
      expect(inputOf(await numberEl({ locale: 'vi', separators: 'none', value: 1234.5, fractional: true })).value).toBe('1234,5');
    });

    // Ark shares one parser among the page's number inputs, so a field read after a `none` field must not inherit it.
    it('reads groups in a field beside one without them', async () => {
      const plain = await numberEl({ separators: 'none', fractional: true });
      const grouped = document.createElement('af-number-input') as NumberEl;
      Object.assign(grouped, { locale: 'vi', fractional: true });
      document.body.append(grouped);
      await settle();
      const seen = listen(grouped);
      edit(inputOf(plain), '1234,5');
      key(inputOf(plain), 'Enter');
      edit(inputOf(grouped), '1.234,5');
      key(inputOf(grouped), 'Enter');
      await settle();
      expect(seen).toEqual([{ value: 1234.5 }]);
    });

    it('the refusal example follows the preset', async () => {
      const el = await numberEl({ locale: 'en', separators: 'dot_comma', value: 7, fractional: true });
      const input = inputOf(el);
      edit(input, '1,234.5');
      key(input, 'Enter');
      await settle();
      expect(internals(el).__message).toBe('Enter a number as 1.234,5.');
    });
  });

  it('steps with ArrowUp, and not past max', async () => {
    const el = await numberEl({ value: 5, step: 1, max: 6 });
    const input = inputOf(el);
    const seen = listen(el);
    input.focus();
    key(input, 'ArrowUp');
    await settle();
    expect(seen).toEqual([{ value: 6 }]);
    el.value = 6;
    await settle();
    key(input, 'ArrowUp');
    await settle();
    expect(seen).toEqual([{ value: 6 }]);
  });

  it('steps a percent by one point when no step is given', async () => {
    const el = await numberEl({ format: 'percent', value: 0.15 });
    const input = inputOf(el);
    expect(spaced(input.value)).toBe('15%');
    const seen = listen(el);
    input.focus();
    key(input, 'ArrowUp');
    await settle();
    expect(seen).toEqual([{ value: 0.16 }]);
  });

  it('keeps the fraction digits typed when fractional, and shows as many as the value has', async () => {
    const el = await numberEl({ fractional: true });
    const input = inputOf(el);
    const seen = listen(el);
    edit(input, '3,14159');
    key(input, 'Enter');
    await settle();
    expect(seen).toEqual([{ value: 3.14159 }]);
    el.value = 3.14159;
    await settle();
    expect(input.value).toBe('3,14159');
    el.value = 1234.567;
    await settle();
    expect(input.value).toBe('1.234,567');

    // Stepping by a tenth adds no binary noise to the digits it keeps.
    el.step = 0.1;
    el.value = 0.2;
    await settle();
    input.focus();
    key(input, 'ArrowUp');
    await settle();
    expect(seen.at(-1)).toEqual({ value: 0.3 });

    // A precision still sets the digits, with or without fractional.
    el.precision = 2;
    el.value = 5;
    await settle();
    edit(input, '1,239');
    key(input, 'Enter');
    await settle();
    expect(seen.at(-1)).toEqual({ value: 1.24 });
  });

  it('keeps a whole step to whole numbers without fractional', async () => {
    const el = await numberEl({ value: 3.14159 });
    const input = inputOf(el);
    const seen = listen(el);
    expect(input.value).toBe('3');
    edit(input, '3,7');
    key(input, 'Enter');
    await settle();
    expect(seen).toEqual([{ value: 4 }]);
  });

  it('shows and emits the percentage itself when a percent is unscaled', async () => {
    const el = await numberEl({ format: 'percent', unscaled: true, value: 12.5 });
    const input = inputOf(el);
    const seen = listen(el);
    expect(spaced(input.value)).toBe('12,5%');
    edit(input, '7,25');
    key(input, 'Enter');
    await settle();
    expect(seen).toEqual([{ value: 7.25 }]);

    // A step is a point, and the sign may be typed with the number.
    el.value = 12.5;
    await settle();
    input.focus();
    key(input, 'ArrowUp');
    await settle();
    expect(seen.at(-1)).toEqual({ value: 13.5 });
    edit(input, '33,3%');
    input.blur();
    await settle();
    expect(seen.at(-1)).toEqual({ value: 33.3 });

    el.locale = 'en';
    el.value = 33.3;
    await settle();
    expect(spaced(input.value)).toBe('33.3%');

    // The range is read in points too.
    el.min = 40;
    await settle();
    expect(internals(el).__validity).toEqual({ rangeUnderflow: true });
    expect(internals(el).__message).toBe('Must be 40% or more.');
  });

  it('an unscaled percent reports aria-valuenow in points', async () => {
    const el = await numberEl({ format: 'percent', unscaled: true, value: 12.5 });
    expect(inputOf(el).getAttribute('aria-valuenow')).toBe('12.5');
  });

  it('shows currency and percent as Intl formats them', async () => {
    expect(spaced(inputOf(await numberEl({ format: 'currency', currency: 'VND', value: 1500000 })).value)).toBe('1.500.000 ₫');
    expect(spaced(inputOf(await numberEl({ format: 'percent', value: 0.15 })).value)).toBe('15%');
  });

  it('draws the steppers, named in its language, only when asked', async () => {
    const el = await numberEl({ steppers: true, value: 2 });
    const increment = shadow(el).querySelector('[part="increment"]') as HTMLElement;
    expect(increment.getAttribute('aria-label')).toBe('Tăng');
    expect(shadow(el).querySelector('[part="decrement"]')?.getAttribute('aria-label')).toBe('Giảm');
    const seen = listen(el);
    increment.click();
    expect(seen).toEqual([{ value: 3 }]);
    const plain = await numberEl({});
    expect(shadow(plain).querySelector('[part="increment"]')).toBeNull();
    expect(shadow(plain).querySelector('[part="decrement"]')).toBeNull();
  });

  describe('in a form', () => {
    it('submits its number under its name, and is under its range below min', async () => {
      const el = await numberEl({ name: 'qty', value: 3 });
      expect(internals(el).__value).toBe('3');
      expect(internals(el).__validity).toEqual({});
      el.min = 5;
      await settle();
      expect(internals(el).__validity).toEqual({ rangeUnderflow: true });
      expect(internals(el).__message).toBe('Phải từ 5 trở lên.');
    });

    it('reads a blank value attribute as no value, shown and on reset alike', async () => {
      document.body.innerHTML = '<af-number-input value="" name="qty"></af-number-input>';
      const el = document.querySelector('af-number-input') as NumberEl & { formResetCallback(): void };
      await settle();
      expect(el.value).toBeNull();
      expect(inputOf(el).value).toBe('');
      expect(internals(el).__value).toBeNull();
      const seen = listen(el);
      el.formResetCallback();
      expect(seen).toEqual([]);
      el.setAttribute('value', '3');
      await settle();
      expect(inputOf(el).value).toBe('3');
      el.setAttribute('value', ' ');
      await settle();
      expect(inputOf(el).value).toBe('');
    });

    it('emits its value attribute as a number on reset', async () => {
      const el = (await numberEl({})) as NumberEl & { formResetCallback(): void };
      el.setAttribute('value', '4');
      el.value = 9;
      await settle();
      const seen = listen(el);
      el.formResetCallback();
      expect(seen).toEqual([{ value: 4 }]);
    });
  });
});
