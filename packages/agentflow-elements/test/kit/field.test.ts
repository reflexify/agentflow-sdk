import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../src/kit/index.js';
import { keepOwned } from '../../src/kit/form/owned.js';
import { KIT_CSS } from '../../src/kit/index.js';
import { settle, shadow } from '../support.js';

type Field = HTMLElement & {
  label: string | null; description: string | null; error: string | null; invalid: boolean; required: boolean; readonly: boolean;
  edited: boolean; lockedReason: string | null; name: string | null; locale: string | null;
};
type KitControl = HTMLElement & { label: string | null; description: string | null; error: string | null; invalid: boolean; required: boolean; readonly: boolean };
type Fieldset = HTMLElement & { heading: string | null; description: string | null; columns: number };

function mount<T extends HTMLElement = Field>(html: string): T {
  document.body.innerHTML = html;
  return document.body.firstElementChild as T;
}
const tick = () => new Promise((r) => setTimeout(r, 0));
const row = (field: Element) => field.querySelector<HTMLElement>(':scope > .af-field-row')!;
const labelOf = (field: Element) => field.querySelector<HTMLLabelElement>('.af-field-label')!;
const describedBy = (el: Element) => (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);

afterEach(() => {
  document.body.innerHTML = '';
});

describe('<af-field>', () => {
  it('labels and describes a native input, and marks it invalid while it has an error', async () => {
    const field = mount('<af-field label="Email" description="Work address" required><input class="af-input"></af-field>');
    const input = field.querySelector('input')!;
    const label = labelOf(field);
    expect(field.firstElementChild).toBe(row(field));
    expect(row(field).hasAttribute('data-af-owned')).toBe(true);
    expect(label.textContent).toContain('Email');
    expect(input.id).not.toBe('');
    expect(label.htmlFor).toBe(input.id);
    const star = label.querySelector('.af-field-required')!;
    expect(star.textContent).toBe('*');
    expect(star.getAttribute('aria-hidden')).toBe('true');
    expect(input.required).toBe(true);
    expect(input.getAttribute('aria-required')).toBe('true');
    const description = field.querySelector<HTMLElement>('.af-field-description')!;
    expect(description.textContent).toBe('Work address');
    expect(describedBy(input)).toEqual([description.id]);
    expect(input.hasAttribute('aria-invalid')).toBe(false);

    field.error = 'Required';
    const error = field.querySelector<HTMLElement>('.af-field-error')!;
    expect(error.textContent).toBe('Required');
    expect(field.lastElementChild).toBe(error);
    expect(describedBy(input)).toEqual([description.id, error.id]);
    expect(input.getAttribute('aria-invalid')).toBe('true');

    field.removeAttribute('error');
    expect(field.querySelector('.af-field-error')).toBeNull();
    expect(describedBy(input)).toEqual([description.id]);
    expect(input.hasAttribute('aria-invalid')).toBe(false);

    field.invalid = true;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('keeps an id and a describedby of the page’s own, and gives back only what it added', () => {
    const field = mount('<af-field label="Code"><input id="code" aria-describedby="hint" required></af-field><span id="hint">Hint</span>');
    const input = field.querySelector('input')!;
    expect(input.id).toBe('code');
    expect(labelOf(field).htmlFor).toBe('code');
    field.description = 'Six letters';
    expect(describedBy(input)).toEqual(['hint', field.querySelector('.af-field-description')!.id]);
    field.description = null;
    expect(describedBy(input)).toEqual(['hint']);
    expect(input.required, 'the page wrote required; the field never set it').toBe(true);
  });

  it('sets a kit control’s form properties and focuses it from the label', async () => {
    const field = mount('<af-field label="Status" description="Who sees it" required error="Pick one"><af-select></af-select></af-field>');
    const select = field.querySelector('af-select') as KitControl;
    await settle();
    expect(select.label).toBe('Status');
    expect(select.description).toBe('Who sees it');
    expect(select.required).toBe(true);
    expect(select.error).toBe('Pick one');
    expect(select.invalid, 'an error marks the control invalid').toBe(true);
    expect(select.readonly).toBe(false);
    expect(labelOf(field).hasAttribute('for'), 'a label cannot point into a shadow root').toBe(false);
    const focus = vi.spyOn(select, 'focus');
    labelOf(field).click();
    expect(focus).toHaveBeenCalledTimes(1);
    field.removeAttribute('error');
    expect(select.error).toBeNull();
    expect(select.invalid).toBe(false);
    await settle();
    expect(shadow(select).querySelector('[part="trigger"]')!.getAttribute('aria-label')).toBe('Status');
  });

  it('leaves a kit control’s own properties alone, and takes back only what it wrote', async () => {
    const field = mount('<af-field label="Due"><af-date name="due" required label="Hạn"></af-date></af-field>');
    const date = field.querySelector('af-date') as KitControl;
    await settle();
    expect(date.required, 'the field has no required of its own').toBe(true);
    expect(date.readonly).toBe(false);
    expect(date.label).toBe('Due');
    field.required = true;
    field.label = null;
    expect(date.required).toBe(true);
    expect(date.label, 'the label the field wrote goes back to the control’s own').toBe('Hạn');

    const plain = mount('<af-field label="Status" required readonly><af-select></af-select></af-field>');
    const select = plain.querySelector('af-select') as KitControl;
    await settle();
    expect([select.required, select.readonly]).toEqual([true, true]);
    plain.required = false;
    plain.readonly = false;
    expect([select.required, select.readonly], 'what the field set, it takes back').toEqual([false, false]);
  });

  it('wires the control that replaced another: the label focuses the new one, and nothing of the old record carries over', async () => {
    const field = mount('<af-field label="When" required><input></af-field>');
    const first = field.querySelector('input')!;
    expect(first.required).toBe(true);
    first.remove();
    const select = document.createElement('af-select') as KitControl;
    field.append(select);
    await tick();
    await settle();
    expect(first.required, 'given back to the control that left').toBe(false);
    expect(select.required).toBe(true);
    const focusSelect = vi.spyOn(select, 'focus');
    labelOf(field).click();
    expect(focusSelect).toHaveBeenCalledTimes(1);

    select.remove();
    const date = document.createElement('af-date') as KitControl;
    field.append(date);
    await tick();
    await settle();
    expect(select.required, 'a kit control that leaves gets back what the field wrote').toBe(false);
    const focusDate = vi.spyOn(date, 'focus');
    labelOf(field).click();
    expect(focusDate).toHaveBeenCalledTimes(1);
    expect(focusSelect).toHaveBeenCalledTimes(1);

    // A page-required native control in a field that set required on the one before keeps its own required.
    date.remove();
    const own = Object.assign(document.createElement('input'), { required: true, readOnly: true });
    field.append(own);
    await tick();
    field.required = false;
    expect(own.required).toBe(true);
    expect(own.readOnly).toBe(true);
  });

  it('locks its control with a reason the control’s description carries', () => {
    const field = mount('<af-field label="Owner" locked-reason="Set by the workflow"><input></af-field>');
    const input = field.querySelector('input')!;
    expect(field.lockedReason).toBe('Set by the workflow');
    const lock = field.querySelector<HTMLButtonElement>('.af-field-lock')!;
    expect(lock.localName).toBe('button');
    expect(lock.getAttribute('aria-label')).toBe('Locked');
    expect(lock.className.split(' ')).toEqual(expect.arrayContaining(['af-button', 'ghost', 'icon', 'xs']));
    const tooltip = lock.closest('af-tooltip') as HTMLElement & { text: string };
    expect(tooltip).not.toBeNull();
    expect(row(field).contains(tooltip)).toBe(true);
    expect(tooltip.text).toBe('Set by the workflow');
    expect(input.readOnly).toBe(true);
    const ids = describedBy(input);
    expect(ids.map((id) => document.getElementById(id)!.textContent).join(' ')).toContain('Set by the workflow');

    field.locale = 'vi';
    expect(field.querySelector('.af-field-lock')!.getAttribute('aria-label')).toBe('Đã khoá');
    field.lockedReason = null;
    expect(field.querySelector('.af-field-lock')).toBeNull();
    expect(input.readOnly).toBe(false);
    expect(input.hasAttribute('aria-describedby')).toBe(false);
  });

  it('says a locked select or radio group is read-only, and takes back only what it said', async () => {
    for (const control of ['<select><option>a</option></select>', '<div role="radiogroup"><input type="radio" name="p"></div>']) {
      const field = mount(`<af-field label="Owner" locked-reason="Set by the workflow">${control}</af-field>`);
      const el = field.querySelector('select, [role="radiogroup"]')!;
      expect(el.getAttribute('aria-readonly'), control).toBe('true');
      field.lockedReason = null;
      expect(el.hasAttribute('aria-readonly'), control).toBe(false);
      field.readonly = true;
      expect(el.getAttribute('aria-readonly'), control).toBe('true');
      el.remove();
      await tick();
      expect(el.hasAttribute('aria-readonly'), 'a control that leaves gets it back').toBe(false);
    }
    const own = mount('<af-field label="Owner"><select aria-readonly="true"></select></af-field>');
    own.readonly = true;
    own.readonly = false;
    expect(own.querySelector('select')!.getAttribute('aria-readonly'), 'the page’s own stays').toBe('true');
  });

  it('carries a lock to a kit control as readonly, with the reason in its description', async () => {
    const field = mount('<af-field label="Due" description="The day" locked-reason="Set by the workflow"><af-date></af-date></af-field>');
    const date = field.querySelector('af-date') as KitControl;
    await settle();
    expect(date.readonly).toBe(true);
    expect(date.description).toContain('The day');
    expect(date.description).toContain('Set by the workflow');
  });

  it('labels a radio group by reference', () => {
    const field = mount('<af-field label="Priority"><div role="radiogroup"><input type="radio" name="p" value="1"><input type="radio" name="p" value="2"></div></af-field>');
    const group = field.querySelector('[role="radiogroup"]')!;
    const label = labelOf(field);
    expect(label.id).not.toBe('');
    expect(group.getAttribute('aria-labelledby')).toBe(label.id);
    expect(label.hasAttribute('for')).toBe(false);
    expect(field.name, 'a group’s name is its inputs’').toBe('p');
  });

  it('names itself from its control unless it has a name of its own', () => {
    const field = mount('<af-field label="Title"><input name="title"></af-field>');
    expect(field.name).toBe('title');
    field.name = 'heading';
    expect(field.getAttribute('name')).toBe('heading');
    expect(field.name).toBe('heading');
  });

  it('leaves an aside where the page put it', async () => {
    const field = mount('<af-field label="Amount"><input><span slot="aside">AI</span></af-field>');
    const aside = field.querySelector('[slot="aside"]')!;
    const input = field.querySelector('input')!;
    expect(aside.parentElement).toBe(field);
    expect(input.previousElementSibling).toBe(row(field));
    expect(aside.previousElementSibling).toBe(input);
    expect(labelOf(field).htmlFor, 'an aside is never the control').toBe(input.id);
    field.error = 'Too high';
    await tick();
    expect(aside.parentElement).toBe(field);
    expect(aside.previousElementSibling).toBe(input);
  });

  it('keeps the label first and the help last as the page changes its children, and wires a new control', async () => {
    const field = mount('<af-field label="Name" description="Full name" error="Required"><input></af-field>');
    field.append(document.createElement('span'));
    await tick();
    expect(field.firstElementChild).toBe(row(field));
    expect(field.lastElementChild!.className).toBe('af-field-error');
    expect(field.lastElementChild!.previousElementSibling!.className).toBe('af-field-description');

    const replacement = document.createElement('input');
    field.querySelector('input')!.remove();
    field.querySelector(':scope > span')!.remove();
    field.append(replacement);
    await tick();
    expect(labelOf(field).htmlFor).toBe(replacement.id);
    expect(replacement.getAttribute('aria-invalid')).toBe('true');
    expect(describedBy(replacement)).toHaveLength(2);
    expect(field.lastElementChild!.className).toBe('af-field-error');
  });

  it('puts back its own nodes when the page empties it, and stops watching once removed', async () => {
    const field = mount('<af-field label="Name"><input></af-field>');
    field.textContent = 'text';
    await tick();
    expect(field.firstElementChild).toBe(row(field));
    field.remove();
    field.append(document.createElement('span'));
    await tick();
    expect(field.lastElementChild!.localName, 'detached, it moves nothing').toBe('span');
  });

  it('reflects edited and keeps its control untouched', async () => {
    const field = mount('<af-field label="Amount"><input class="af-input" name="amount"></af-field>');
    const input = field.querySelector('input')!;
    const snapshot = () => ({ className: input.className, attributes: Object.fromEntries(input.getAttributeNames().map((n) => [n, input.getAttribute(n)])) });
    const before = snapshot();
    expect(field.edited).toBe(false);
    expect(field.hasAttribute('edited')).toBe(false);

    field.edited = true;
    expect(field.getAttribute('edited')).toBe('');
    await tick();
    expect(snapshot()).toEqual(before);

    field.removeAttribute('edited');
    expect(field.edited).toBe(false);
    field.edited = true;
    field.edited = false;
    expect(field.hasAttribute('edited')).toBe(false);
    await tick();
    expect(snapshot()).toEqual(before);
  });

  it('leaves a kit control as it was while the field is edited', async () => {
    const field = mount('<af-field label="Due"><af-date></af-date></af-field>');
    const date = field.querySelector('af-date') as KitControl;
    await settle();
    const snapshot = () => ({ attributes: date.getAttributeNames().sort(), invalid: date.invalid, readonly: date.readonly, required: date.required });
    const before = snapshot();
    field.edited = true;
    await settle();
    expect(snapshot()).toEqual(before);
  });
});

describe('keepOwned', () => {
  it('moves only its own nodes back to the ends, and stops when disconnected', async () => {
    const host = document.createElement('div');
    const page = document.createElement('p');
    host.append(page);
    document.body.append(host);
    const head = Object.assign(document.createElement('div'), { id: 'head' });
    const tail = Object.assign(document.createElement('div'), { id: 'tail' });
    const stop = keepOwned(host, [head], [tail]);
    expect([...host.children].map((c) => c.id || c.localName)).toEqual(['head', 'p', 'tail']);
    const later = document.createElement('section');
    host.append(later);
    host.prepend(document.createElement('b'));
    await tick();
    expect([...host.children].map((c) => c.id || c.localName)).toEqual(['head', 'b', 'p', 'section', 'tail']);
    stop();
    host.append(document.createElement('i'));
    await tick();
    expect(host.lastElementChild!.localName).toBe('i');
  });
});

describe('<af-fieldset>', () => {
  it('heads a native fieldset, places its children as a form section does, and lets the fieldset disable a kit control', async () => {
    const fieldset = mount<Fieldset>(
      '<af-fieldset heading="Contact" description="How to reach you" columns="2"><fieldset>' +
        '<af-field label="Address" data-span="2"><input></af-field>' +
        '<af-field label="City" data-col="2"><input></af-field>' +
        '<af-field label="Wide" data-span="9" data-col="2"><input></af-field>' +
        '<af-field label="Due"><af-date></af-date></af-field>' +
        '</fieldset></af-fieldset>',
    );
    const native = fieldset.querySelector('fieldset')!;
    expect(fieldset.classList.contains('af-fieldset')).toBe(true);
    const legend = native.firstElementChild as HTMLElement;
    expect(legend.localName).toBe('legend');
    expect(legend.className).toBe('af-fieldset-legend');
    expect(legend.textContent).toBe('Contact');
    expect(legend.hasAttribute('data-af-owned')).toBe(true);
    const description = native.children[1] as HTMLElement;
    expect(description.className).toBe('af-fieldset-description');
    expect(description.textContent).toBe('How to reach you');

    const [address, city, wide, due] = [...native.querySelectorAll<HTMLElement>(':scope > af-field')];
    expect(getComputedStyle(address!).gridColumn).toBe('1 / span 2');
    expect(getComputedStyle(city!).gridColumn).toBe('2 / span 1');
    expect(getComputedStyle(wide!).gridColumn, 'a span past the columns is cut to them, and the column moved left to fit').toBe('1 / span 2');
    expect(due!.style.gridColumn, 'a child with neither attribute flows').toBe('');

    city!.setAttribute('data-span', '2');
    await tick();
    expect(getComputedStyle(city!).gridColumn).toBe('1 / span 2');
    fieldset.columns = 1;
    await tick();
    expect(getComputedStyle(address!).gridColumn).toBe('span 1 / span 1');

    fieldset.heading = 'Reach';
    expect(native.querySelector('legend')!.textContent).toBe('Reach');
    native.prepend(document.createElement('hr'));
    await tick();
    expect(native.firstElementChild).toBe(legend);

    const date = due!.querySelector('af-date') as HTMLElement & { formDisabledCallback(disabled: boolean): void };
    await settle();
    native.disabled = true;
    // jsdom does not run the browser's step that tells a form-associated element its fieldset is disabled; this does.
    date.formDisabledCallback(native.matches(':disabled'));
    await settle();
    expect(date.matches(':disabled')).toBe(true);
    expect((shadow(date).querySelector('[part="input"]') as HTMLInputElement).disabled).toBe(true);
  });

  it('without a native fieldset lays out its own children as a named group', () => {
    const fieldset = mount<Fieldset>('<af-fieldset heading="Contact" columns="3"><af-field label="A" data-span="2"><input></af-field></af-fieldset>');
    const legend = fieldset.firstElementChild as HTMLElement;
    expect(legend.className).toBe('af-fieldset-legend');
    expect(fieldset.getAttribute('role')).toBe('group');
    expect(fieldset.getAttribute('aria-labelledby')).toBe(legend.id);
    expect(getComputedStyle(fieldset.querySelector('af-field')!).gridColumn).toBe('1 / span 2');
    expect(fieldset.columns).toBe(3);
    fieldset.setAttribute('columns', '7');
    expect(fieldset.columns, 'cut to four').toBe(4);
  });

  it('lays four columns out', async () => {
    const fieldset = mount<Fieldset>(
      '<af-fieldset heading="Dates" columns="4"><af-field label="A" data-span="2"><input></af-field><af-field label="B" data-col="4"><input></af-field>' +
        '<af-field label="C" data-span="9"><input></af-field><af-field label="D"><input></af-field></af-fieldset>',
    );
    expect(fieldset.columns).toBe(4);
    expect(fieldset.getAttribute('data-af-columns')).toBe('4');
    const [a, b, c, d] = [...fieldset.querySelectorAll<HTMLElement>(':scope > af-field')];
    expect(getComputedStyle(a!).gridColumn, 'a child with data-span 2 spans two of four tracks').toBe('1 / span 2');
    expect(getComputedStyle(b!).gridColumn).toBe('4 / span 1');
    expect(getComputedStyle(c!).gridColumn, 'a span past four is cut to four').toBe('1 / span 4');
    expect(d!.style.gridColumn).toBe('');
    const style = document.createElement('style');
    style.textContent = KIT_CSS;
    document.head.append(style);
    expect(getComputedStyle(fieldset).gridTemplateColumns).toBe('repeat(4, minmax(0, 1fr))');
    style.remove();
  });
});
