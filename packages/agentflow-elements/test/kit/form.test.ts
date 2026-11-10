import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../src/kit/index.js';
import type { AfSubmitDetail, FormError } from '../../src/kit/index.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Form = HTMLElement & { errors: FormError[]; busy: boolean; dirty: boolean; locale: string | null; strings: Record<string, string> | null };
type Field = HTMLElement & { error: string | null };

const tick = () => new Promise((r) => setTimeout(r, 0));

const FORM = `<af-form>
  <form>
    <af-field label="Email" data-testid="email"><input name="email" value="an@example.com"></af-field>
    <af-field label="City" name="address.city" data-testid="city"><input></af-field>
    <button>Save</button>
  </form>
</af-form>`;

function mount(html = FORM) {
  document.body.innerHTML = html;
  const el = document.body.querySelector('af-form') as Form;
  const form = el.querySelector('form')!;
  const submits: AfSubmitDetail[] = [];
  el.addEventListener('af-submit', (e) => submits.push((e as CustomEvent<AfSubmitDetail>).detail));
  return { el, form, submits };
}
const field = (id: string) => document.querySelector(`[data-testid="${id}"]`) as Field;
const summary = (form: HTMLFormElement) => form.querySelector<HTMLElement>(':scope > .af-form-summary');

let root: Root | null = null;
afterEach(async () => {
  await act(async () => root?.unmount());
  root = null;
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('<af-form>', () => {
  it('turns the native submit into one af-submit with the form’s data', () => {
    const { form, submits } = mount();
    let prevented = false;
    document.body.addEventListener('submit', (e) => (prevented = e.defaultPrevented));
    form.requestSubmit();
    expect(prevented).toBe(true);
    expect(submits).toHaveLength(1);
    expect(submits[0]!.formData).toBeInstanceOf(FormData);
    expect(submits[0]!.formData.get('email')).toBe('an@example.com');
  });

  it('emits once while the page is busy, and again once busy clears or when the page never set it', async () => {
    const { el, form, submits } = mount();
    el.addEventListener('af-submit', () => (el.busy = true));
    form.requestSubmit();
    form.requestSubmit();
    await tick();
    form.requestSubmit();
    expect(submits).toHaveLength(1);
    el.busy = false;
    form.requestSubmit();
    expect(submits).toHaveLength(2);

    const quiet = mount();
    quiet.form.requestSubmit();
    quiet.form.requestSubmit();
    expect(quiet.submits, 'locked until the page has had its turn').toHaveLength(1);
    await tick();
    quiet.form.requestSubmit();
    expect(quiet.submits).toHaveLength(2);
  });

  it('marks the submit buttons aria-disabled while busy, leaving them focusable', () => {
    const { el, form } = mount(FORM.replace('<button>Save</button>', '<button>Save</button><button type="submit">Go</button><button type="button">Other</button>'));
    const [save, go, other] = [...form.querySelectorAll('button')];
    el.busy = true;
    expect(save!.getAttribute('aria-disabled')).toBe('true');
    expect(go!.getAttribute('aria-disabled')).toBe('true');
    expect(other!.hasAttribute('aria-disabled')).toBe(false);
    expect(save!.disabled).toBe(false);
    save!.focus();
    expect(document.activeElement).toBe(save);
    el.busy = false;
    expect(save!.hasAttribute('aria-disabled')).toBe(false);
  });

  it('puts a matched error on its field, with no summary, and focuses the field’s control', () => {
    const { el, form } = mount();
    el.errors = [{ path: '/email', message: 'Taken' }];
    expect(field('email').error).toBe('Taken');
    expect(summary(form)).toBeNull();
    expect(document.activeElement).toBe(field('email').querySelector('input'));

    el.errors = [{ path: '/address/city', message: 'Unknown' }];
    expect(field('email').error).toBeNull();
    expect(field('city').error).toBe('Unknown');
    el.errors = [];
    expect(field('city').error).toBeNull();
  });

  it('summarises a message that matches no field, links each matched field, and focuses the summary', () => {
    const { el, form } = mount();
    el.errors = [{ path: '/email', message: 'Taken' }, { path: '', message: 'Try later' }];
    const box = summary(form)!;
    expect(box).not.toBeNull();
    expect(form.firstElementChild).toBe(box);
    expect(box.hasAttribute('data-af-owned')).toBe(true);
    expect(box.getAttribute('role')).toBe('alert');
    expect(box.textContent).toContain('Some fields need attention');
    expect(box.textContent).toContain('Try later');
    expect(document.activeElement).toBe(box);
    const link = [...box.querySelectorAll('a')].find((a) => a.textContent === 'Email')!;
    expect(link).toBeDefined();
    link.click();
    expect(document.activeElement).toBe(field('email').querySelector('input'));

    el.locale = 'vi';
    expect(summary(form)!.textContent).toContain('Một số trường cần sửa');
    el.errors = [];
    expect(summary(form)).toBeNull();
  });

  it('moves focus again only when the errors differ, not for the same ones in a new array', () => {
    const { el, form } = mount();
    const outside = document.createElement('button');
    document.body.append(outside);
    el.errors = [{ path: '/email', message: 'Taken' }, { path: '', message: 'Try later' }];
    expect(document.activeElement).toBe(summary(form));
    outside.focus();
    el.errors = [{ path: '/email', message: 'Taken' }, { path: '', message: 'Try later' }];
    expect(document.activeElement).toBe(outside);
    expect(field('email').error).toBe('Taken');
    expect(summary(form)).not.toBeNull();
    el.errors = [{ path: '/email', message: 'Still taken' }, { path: '', message: 'Try later' }];
    expect(document.activeElement).toBe(summary(form));
  });

  it('changes nothing on the page for the same errors in a new array, and keeps a summary link’s focus', async () => {
    const { el, form } = mount();
    const errors = () => [{ path: '/email', message: 'Taken' }, { path: '/address/city', message: 'Unknown' }, { path: '', message: 'Try later' }];
    el.errors = errors();
    const box = summary(form)!;
    const children = [...box.querySelectorAll('*')];
    const changes: string[] = [];
    const watch = new MutationObserver((records) => changes.push(...records.map((r) => `${(r.target as Element).localName ?? 'text'} ${r.type} ${r.attributeName ?? ''}`)));
    for (const id of ['email', 'city']) watch.observe(field(id), { attributes: true, attributeFilter: ['error'], childList: true, subtree: true });
    watch.observe(box, { attributes: true, childList: true, subtree: true, characterData: true });
    const link = [...box.querySelectorAll('a')].find((a) => a.textContent === 'Email')!;
    link.focus();

    el.errors = errors();
    await tick();
    expect(changes, 'no error attribute, field node or summary node changed').toEqual([]);
    expect(summary(form)).toBe(box);
    expect([...box.querySelectorAll('*')].every((n, i) => n === children[i])).toBe(true);
    expect(document.activeElement).toBe(link);

    el.locale = 'vi';
    el.strings = { formErrors: 'Check these' };
    expect(box.textContent).toContain('Check these');
    expect(document.activeElement, 'a change of language keeps the link’s focus').toBe(link);

    el.errors = [{ path: '/email', message: 'Still taken' }, { path: '/address/city', message: 'Unknown' }, { path: '', message: 'Try later' }];
    expect(field('email').error).toBe('Still taken');
    el.errors = [{ path: '', message: 'Try later' }];
    expect([field('email').error, field('city').error]).toEqual([null, null]);
    watch.disconnect();
  });

  it('leaves an error the page set on a field itself', () => {
    const { el } = mount();
    field('city').error = 'Page’s own';
    el.errors = [{ path: '/email', message: 'Taken' }];
    el.errors = [{ path: '', message: 'Try later' }];
    expect(field('email').error).toBeNull();
    expect(field('city').error).toBe('Page’s own');
  });

  it('holds one beforeunload listener on window while dirty', () => {
    const { el } = mount();
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    el.dirty = true;
    el.dirty = true;
    expect(add.mock.calls.filter(([type]) => type === 'beforeunload')).toHaveLength(1);
    const unload = new Event('beforeunload', { cancelable: true });
    // A BeforeUnloadEvent's returnValue is a string, which older Safari needs set before it asks.
    Object.defineProperty(unload, 'returnValue', { value: 'unset', writable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(true);
    expect((unload as unknown as { returnValue: unknown }).returnValue).toBe('');
    el.dirty = false;
    expect(remove.mock.calls.filter(([type]) => type === 'beforeunload')).toHaveLength(1);
    const later = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(later);
    expect(later.defaultPrevented).toBe(false);

    el.dirty = true;
    el.remove();
    expect(remove.mock.calls.filter(([type]) => type === 'beforeunload')).toHaveLength(2);
  });

  it('keeps its summary first while React re-renders the form’s children', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    const view = (extra: boolean) =>
      createElement('af-form', null, createElement('form', null,
        extra ? createElement('p', { key: 'p' }, 'Note') : null,
        createElement('af-field', { key: 'e', label: 'Email' }, createElement('input', { name: 'email' })),
        createElement('button', { key: 'b' }, 'Save'),
      ));
    await act(async () => root!.render(view(false)));
    const el = container.querySelector('af-form') as Form;
    el.errors = [{ path: '', message: 'Try later' }];
    await act(async () => root!.render(view(true)));
    await tick();
    const form = el.querySelector('form')!;
    expect(form.firstElementChild!.className).toContain('af-form-summary');
    expect(form.children[1]!.localName).toBe('p');
    await act(async () => root!.render(view(false)));
    await tick();
    expect(form.firstElementChild!.className).toContain('af-form-summary');
    expect(form.querySelector('p')).toBeNull();
  });
});
