import { describe, expect, it, vi } from 'vitest';
import { formAssociate, onFormEvents, writeForm } from '../../src/kit/form/associate.js';

type Recorded = ElementInternals & { __value?: unknown; __validity?: ValidityStateFlags; __message?: string };
type Fixture = HTMLElement & {
  internals: Recorded;
  formResetCallback(): void;
  formDisabledCallback(disabled: boolean): void;
};

const Fixture = formAssociate(class extends HTMLElement {});
customElements.define('af-form-associate-fixture', Fixture);
const fixture = () => document.createElement('af-form-associate-fixture') as Fixture;

describe('formAssociate', () => {
  it('makes the element form-associated', () => {
    expect((Fixture as unknown as { formAssociated: boolean }).formAssociated).toBe(true);
  });

  it('writes a string, each entry of an array under the name, and null', () => {
    const el = fixture();
    writeForm(el, { name: 'who', value: 'a', validity: {}, message: '' });
    expect(el.internals.__value).toBe('a');
    writeForm(el, { name: 'who', value: ['a', 'b'], validity: {}, message: '' });
    expect([...(el.internals.__value as FormData)]).toEqual([['who', 'a'], ['who', 'b']]);
    writeForm(el, { name: 'who', value: null, validity: {}, message: '' });
    expect(el.internals.__value).toBeNull();
  });

  it('writes validity and its message, and clears both when valid', () => {
    const el = fixture();
    writeForm(el, { name: 'due', value: null, validity: { valueMissing: true }, message: 'Fill in this field.' });
    expect(el.internals.__validity).toEqual({ valueMissing: true });
    expect(el.internals.__message).toBe('Fill in this field.');
    expect(el.internals.checkValidity()).toBe(false);
    writeForm(el, { name: 'due', value: '2026-11-05', validity: {}, message: '' });
    expect(el.internals.checkValidity()).toBe(true);
  });

  it('never writes a flag with an empty message, which the browser refuses', () => {
    const el = fixture();
    writeForm(el, { name: 'due', value: null, validity: { valueMissing: true }, message: '' });
    expect(el.internals.__validity).toEqual({ valueMissing: true });
    expect(el.internals.__message).toBe('Fill in this field.');
  });

  it('focuses the input part, not the first focusable element in its shadow root', () => {
    const el = fixture();
    el.attachShadow({ mode: 'open', delegatesFocus: true }).innerHTML = '<button part="remove">x</button><input part="input">';
    document.body.append(el);
    el.focus();
    expect(el.shadowRoot!.activeElement).toBe(el.shadowRoot!.querySelector('input'));
    el.remove();
  });

  it('calls the registered hooks on reset and on a disabled fieldset, even one reported before they registered', () => {
    const el = fixture();
    el.formDisabledCallback(true);
    const hooks = { reset: vi.fn(), disabled: vi.fn() };
    onFormEvents(el, hooks);
    expect(hooks.disabled).toHaveBeenCalledWith(true);
    el.formResetCallback();
    expect(hooks.reset).toHaveBeenCalledOnce();
    el.formDisabledCallback(false);
    expect(hooks.disabled).toHaveBeenLastCalledWith(false);
  });
});
