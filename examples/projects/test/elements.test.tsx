// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import { useLayoutEffect, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Confirm, Dialog, DateInput, KitTheme, PersonPicker, ToastRegion, Tooltip, useToast } from '../src/kit/elements.js';

afterEach(() => cleanup());

const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 20)); });
const part = (el: Element, name: string) => el.shadowRoot!.querySelector(`[part="${name}"]`) as HTMLElement;

describe('the kit wrappers', () => {
  it('set properties on the element and hand an event its detail', async () => {
    const seen: unknown[] = [];
    const { container } = render(<DateInput value="2026-10-01" locale="en" onChange={(d) => seen.push(d)} />);
    const el = container.querySelector('af-date') as HTMLElement & { value: string };
    expect(el.value).toBe('2026-10-01');
    el.dispatchEvent(new CustomEvent('change', { detail: { value: '2026-10-02' } }));
    expect(seen).toEqual([{ value: '2026-10-02' }]);
  });

  it('hand a person picker its label, and whether its people are still loading', () => {
    const people = [{ id: 'p1', name: 'Lê Minh', email: null }];
    const view = render(<PersonPicker people={people} value="p2" label="Người chính" loading locale="vi" onChange={() => {}} />);
    const el = () => view.container.querySelector('af-person-picker') as HTMLElement & { label: string | null; loading: boolean };
    expect([el().label, el().loading]).toEqual(['Người chính', true]);
    view.rerender(<PersonPicker people={people} value="p2" label="Người chính" locale="vi" onChange={() => {}} />);
    expect(el().loading).toBe(false);
  });

  it("say the theme they are under on each element, changing it in place", () => {
    const ui = (mode: 'light' | 'dark') => <KitTheme mode={mode}><DateInput value={null} locale="vi" onChange={() => {}} /></KitTheme>;
    const view = render(ui('light'));
    const el = view.container.querySelector('af-date')!;
    expect(el.getAttribute('data-theme')).toBe('light');
    view.rerender(ui('dark'));
    expect(view.container.querySelector('af-date')).toBe(el);
    expect(el.getAttribute('data-theme')).toBe('dark');
  });

  it('render slotted children with the element, so the slot exists', async () => {
    const { container } = render(<Dialog open heading="Hello" locale="en" onClose={() => {}} actions={<button>Ok</button>}><p>Body</p></Dialog>);
    await settle();
    const el = container.querySelector('af-dialog') as HTMLElement;
    expect(el.querySelector('[slot="actions"] button')?.textContent).toBe('Ok');
    expect(el.shadowRoot!.querySelector('slot[name="actions"]')).not.toBeNull();
  });

  it('unlock a confirm after a press once busy has gone true and then false', async () => {
    let confirmed = 0;
    function Host() {
      const [busy, setBusy] = useState(false);
      return (
        <>
          <button data-testid="busy" onClick={() => setBusy((b) => !b)} />
          <Confirm open heading="x" confirmLabel="OK" locale="en" busy={busy} onConfirm={() => { confirmed += 1; }} onCancel={() => {}} />
        </>
      );
    }
    const { container, getByTestId } = render(<Host />);
    await settle();
    const el = container.querySelector('af-confirm') as HTMLElement;
    part(el, 'confirm').click();
    part(el, 'confirm').click();
    await settle();
    expect(confirmed).toBe(1);
    act(() => getByTestId('busy').click());
    await settle();
    act(() => getByTestId('busy').click());
    await settle();
    part(el, 'confirm').click();
    await settle();
    expect(confirmed).toBe(2);
  });

  it('call a toast action once, by the toast it belongs to', async () => {
    const pressed: string[] = [];
    function Press() {
      const toast = useToast();
      return <button data-testid="go" onClick={() => toast({ kind: 'info', text: 'Done', action: { label: 'Undo', onSelect: () => pressed.push('undo') } })} />;
    }
    const { container, getByTestId } = render(<ToastRegion locale="en"><Press /></ToastRegion>);
    // Pressed before the element has connected: the toast waits for it.
    act(() => getByTestId('go').click());
    await settle();
    const el = container.querySelector('af-toast') as HTMLElement;
    part(el, 'action').click();
    part(el, 'action').click();
    await settle();
    expect(pressed).toEqual(['undo']);
  });

  it('shows a toast raised from a layout effect on the first mount', async () => {
    function Early() {
      const toast = useToast();
      useLayoutEffect(() => toast({ kind: 'info', text: 'Early' }), [toast]);
      return null;
    }
    const { container } = render(<ToastRegion locale="en"><Early /></ToastRegion>);
    await settle();
    const el = container.querySelector('af-toast') as HTMLElement;
    expect(el.shadowRoot!.querySelector('[part="text"]')?.textContent).toBe('Early');
  });

  it('says so once when the toast element never becomes ready', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      let raise!: ReturnType<typeof useToast>;
      function Grab() {
        raise = useToast();
        return null;
      }
      const { unmount } = render(<ToastRegion locale="en"><Grab /></ToastRegion>);
      unmount();
      raise({ kind: 'info', text: 'Lost' });
      await act(async () => { await new Promise((r) => setTimeout(r, 200)); });
      expect(errors).toHaveBeenCalledTimes(1);
    } finally {
      errors.mockRestore();
    }
  });

  it('says a pointer arrival again once the tooltip it armed has mounted, so one move opens it', async () => {
    const { getByRole } = render(<Tooltip text="Thiết kế màn hình đăng nhập" locale="vi"><button type="button">Thiết kế…</button></Tooltip>);
    const button = getByRole('button');
    const heard: boolean[] = [];
    button.addEventListener('pointerover', (e) => heard.push(e.isTrusted));
    act(() => { button.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, composed: true, pointerType: 'mouse' })); });
    expect(button.closest('af-tooltip')).not.toBeNull();
    await settle();
    expect(heard).toHaveLength(2);
  });

  it('says nothing again once the pointer has left before the tooltip mounted', async () => {
    const { getByRole } = render(<Tooltip text="Tên dài" locale="vi"><button type="button">Tên</button></Tooltip>);
    const button = getByRole('button');
    let heard = 0;
    button.addEventListener('pointerover', () => heard++);
    act(() => { button.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, composed: true, pointerType: 'mouse' })); });
    button.parentElement!.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' }));
    await settle();
    expect(heard).toBe(1);
  });

  it('keeps focus on a control inside when a pointer arms its tooltip', async () => {
    let cut = false;
    const { getByRole } = render(<Tooltip text="Tên rất dài" locale="vi" whenCutShort><button type="button">Tên</button></Tooltip>);
    const button = getByRole('button');
    Object.defineProperty(button, 'scrollWidth', { get: () => (cut ? 200 : 0) });
    Object.defineProperty(button, 'clientWidth', { get: () => 100 });
    // Focused while shown whole: no tooltip mounts.
    act(() => button.focus());
    expect(button.closest('af-tooltip')).toBeNull();
    cut = true;
    act(() => { button.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, composed: true, pointerType: 'mouse' })); });
    await settle();
    expect(button.closest('af-tooltip')).not.toBeNull();
    expect(document.activeElement).toBe(button);
  });
});
