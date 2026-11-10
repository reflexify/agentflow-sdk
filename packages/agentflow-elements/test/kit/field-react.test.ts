import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import '../../src/kit/index.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
afterEach(async () => {
  await act(async () => root?.unmount());
  root = null;
  document.body.innerHTML = '';
});

const tick = () => new Promise((r) => setTimeout(r, 0));

describe('<af-field> and <af-fieldset> in React 19', () => {
  it('lets React swap the control and append a child, keeping the label first and wiring the current control', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    const errors: unknown[] = [];
    const onError = (e: ErrorEvent) => errors.push(e.error);
    window.addEventListener('error', onError);
    const view = (show: boolean, extra = false, error: string | null = 'Required') =>
      createElement(
        'af-fieldset',
        { heading: 'Section', columns: 2 },
        createElement(
          'fieldset',
          null,
          createElement(
            'af-field',
            { label: 'A', description: 'Help', error, 'data-span': 2 },
            show ? createElement('input', { key: 'i', name: 'a' }) : createElement('textarea', { key: 't', name: 'a' }),
            extra ? createElement('span', { key: 's' }, 'extra') : null,
          ),
        ),
      );

    const check = () => {
      const field = container.querySelector('af-field')!;
      const control = field.querySelector('input, textarea')!;
      const label = field.querySelector('label')!;
      expect(field.firstElementChild!.className).toBe('af-field-row');
      expect(field.lastElementChild!.className).toBe('af-field-error');
      expect(label.htmlFor).toBe(control.id);
      expect(control.getAttribute('aria-invalid')).toBe('true');
      expect(container.querySelector('fieldset')!.firstElementChild!.localName).toBe('legend');
      return control;
    };

    await act(async () => root!.render(view(true)));
    await tick();
    expect(check().localName).toBe('input');
    for (const show of [false, true, false]) {
      await act(async () => root!.render(view(show, !show)));
      await tick();
      expect(check().localName).toBe(show ? 'input' : 'textarea');
    }
    await act(async () => root!.render(view(true, true, null)));
    await tick();
    const field = container.querySelector('af-field')!;
    expect(field.querySelector('.af-field-error')).toBeNull();
    expect(field.lastElementChild!.className).toBe('af-field-description');
    window.removeEventListener('error', onError);
    expect(errors).toEqual([]);
  });

  it('unmounts cleanly', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () =>
      root!.render(createElement('af-field', { label: 'A', 'locked-reason': 'Set by the workflow' }, createElement('input'))),
    );
    await tick();
    await act(async () => root!.unmount());
    root = null;
    expect(container.childNodes).toHaveLength(0);
  });
});
