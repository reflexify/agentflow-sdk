import { describe, expect, it } from 'vitest';
import '../../src/kit/index.js';
import { settle, shadow, watchDocumentKeyListeners } from '../support.js';

const STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'todo', label: 'Todo' },
  { value: 'triage', label: 'Triage' },
  { value: 'archived', label: 'Archived', disabled: true, reason: 'Only a manager archives' },
];
type SelectEl = HTMLElement & { options: unknown; value: unknown; multiple: boolean; label: string | null; locale: string | null };

async function select(props: Record<string, unknown>) {
  document.body.innerHTML = '';
  const el = document.createElement('af-select') as SelectEl;
  Object.assign(el, { options: STATUSES }, props);
  document.body.append(el);
  await settle();
  return el;
}
const trigger = (el: HTMLElement) => shadow(el).querySelector('[part="trigger"]') as HTMLButtonElement;
const shownValue = (el: HTMLElement) => shadow(el).querySelector('[part="value"]')?.textContent?.trim();
const option = (el: HTMLElement, label: string) =>
  [...shadow(el).querySelectorAll<HTMLElement>('[part="option"]')].find((o) => o.textContent?.trim() === label)!;
const heard = (el: HTMLElement) => {
  const seen: unknown[] = [];
  el.addEventListener('change', (e) => seen.push((e as CustomEvent).detail));
  return seen;
};
async function openList(el: HTMLElement) {
  trigger(el).click();
  await settle();
}

describe('<af-select>', () => {
  it('names its trigger from label and shows the chosen option’s label', async () => {
    const el = await select({ value: 'closed', label: 'Trạng thái', description: 'Ai cũng thấy' });
    expect(trigger(el).getAttribute('aria-label')).toBe('Trạng thái');
    // No label element is drawn, so a labelledby reference would point at nothing and hide the aria-label.
    expect(trigger(el).hasAttribute('aria-labelledby')).toBe(false);
    const described = shadow(el).getElementById(trigger(el).getAttribute('aria-describedby')!);
    expect(described?.textContent).toBe('Ai cũng thấy');
    expect(shownValue(el)).toBe('Closed');
  });

  it('emits the picked value once, and shows it only once the page sets it', async () => {
    const el = await select({ value: 'open', label: 'Status' });
    const seen = heard(el);
    await openList(el);
    option(el, 'Todo').click();
    await settle();
    expect(seen).toEqual([{ value: 'todo' }]);
    expect(shownValue(el)).toBe('Open');
    el.value = 'todo';
    await settle();
    expect(shownValue(el)).toBe('Todo');
  });

  it('marks its host raised while the list is open', async () => {
    const el = await select({ value: null });
    await openList(el);
    expect(el.dataset.raised).toBe('true');
  });

  it('never picks a disabled option, and carries its reason as the option’s description', async () => {
    const el = await select({ value: null });
    const seen = heard(el);
    await openList(el);
    const archived = option(el, 'Archived');
    expect(archived.getAttribute('aria-description')).toBe('Only a manager archives');
    expect((archived.closest('af-tooltip') as unknown as { text: string }).text).toBe('Only a manager archives');
    archived.click();
    await settle();
    expect(seen).toEqual([]);
  });

  it('highlights the first option starting with a letter typed on the closed, focused trigger', async () => {
    const el = await select({ value: null });
    const seen = heard(el);
    const letters: string[] = [];
    const listen = (e: Event) => letters.push((e as KeyboardEvent).key);
    document.addEventListener('keydown', listen);
    trigger(el).focus();
    trigger(el).dispatchEvent(new KeyboardEvent('keydown', { key: 't', bubbles: true, composed: true }));
    await settle();
    document.removeEventListener('keydown', listen);
    expect(option(el, 'Todo').hasAttribute('data-highlighted')).toBe(true);
    expect(option(el, 'Triage').hasAttribute('data-highlighted')).toBe(false);
    expect(seen).toEqual([]);
    expect(letters, 'the page hears the letter once').toEqual(['t']);
  });

  it('emits every chosen value with multiple, and joins their labels in the trigger', async () => {
    const el = await select({ value: ['open'], multiple: true });
    const seen = heard(el);
    await openList(el);
    option(el, 'Closed').click();
    await settle();
    expect(seen).toEqual([{ value: ['open', 'closed'] }]);
    el.value = ['open', 'closed'];
    await settle();
    expect(shownValue(el)).toBe('Open, Closed');
  });

  it('says there are no options in an empty list, in the element’s language', async () => {
    const el = await select({ value: null, options: [], locale: 'vi' });
    await openList(el);
    expect(shadow(el).querySelector('[part="empty"]')?.textContent?.trim()).toBe('Không có lựa chọn');
  });

  it('shows the placeholder, never the raw value, for a value the options do not hold', async () => {
    const el = await select({ value: 'gone', placeholder: 'Choose a status' });
    expect(shownValue(el)).toBe('Choose a status');
  });

  it('marks its trigger small with size="sm", by attribute or property, and only then', async () => {
    const plain = await select({ value: 'open' });
    expect(trigger(plain).hasAttribute('data-size')).toBe(false);
    document.body.innerHTML = '<af-select size="sm"></af-select>';
    await settle();
    expect(trigger(document.querySelector('af-select')!).getAttribute('data-size')).toBe('sm');
    const byProperty = await select({ value: 'open', size: 'sm' });
    expect(trigger(byProperty).getAttribute('data-size')).toBe('sm');
  });

  it('says it is read-only, and keeps its list closed while it is', async () => {
    const open = await select({ value: 'open' });
    expect(trigger(open).hasAttribute('aria-readonly')).toBe(false);
    await openList(open);
    expect(open.dataset.raised).toBe('true');
    const fixed = await select({ value: 'open', readonly: true });
    expect(trigger(fixed).getAttribute('aria-readonly')).toBe('true');
    await openList(fixed);
    expect(fixed.dataset.raised).not.toBe('true');
  });

  it('adds no key listener of its own to document or window, mounted or open', async () => {
    const watch = watchDocumentKeyListeners();
    try {
      const el = await select({ value: null });
      await openList(el);
      expect(watch.fromKit()).toEqual([]);
    } finally {
      watch.restore();
    }
  });

  describe('in a form', () => {
    type Recorded = { __value?: unknown; __validity?: ValidityStateFlags };
    type FormSelect = SelectEl & { internals: Recorded; formResetCallback(): void };

    it('records its value under its name', async () => {
      const el = (await select({ name: 'status', value: 'todo' })) as FormSelect;
      expect(el.internals.__value).toBe('todo');
    });

    it('is missing a value when required and empty', async () => {
      const el = (await select({ required: true, value: null })) as FormSelect;
      expect(el.internals.__validity).toEqual({ valueMissing: true });
    });

    it('says a missing value in English when the page’s strings blank the message', async () => {
      const el = (await select({ required: true, value: null, strings: { valueMissing: '' } })) as FormSelect & { internals: { __message?: string } };
      expect(el.internals.__message).toBe('Fill in this field.');
    });

    it('emits its written default on reset, and nothing when it already holds it', async () => {
      document.body.innerHTML = '<af-select value="open"></af-select>';
      const el = document.querySelector('af-select') as FormSelect;
      el.options = STATUSES;
      await settle();
      const seen = heard(el);
      el.formResetCallback();
      expect(seen).toEqual([]);
      el.value = 'closed';
      await settle();
      el.formResetCallback();
      expect(seen).toEqual([{ value: 'open' }]);
    });
  });
});
