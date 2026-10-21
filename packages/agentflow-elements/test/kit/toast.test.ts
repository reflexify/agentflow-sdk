import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../src/kit/index.js';
import { settle, shadow, watchDocumentKeyListeners } from '../support.js';

type ToastEl = HTMLElement & { show(i: unknown): string; dismiss(id: string): void; locale: string };
afterEach(() => vi.useRealTimers());

describe('<af-toast>', () => {
  it('shows a success toast and closes it after four seconds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    document.body.innerHTML = '';
    const el = document.createElement('af-toast') as ToastEl;
    el.locale = 'vi';
    document.body.append(el);
    await settle();
    el.show({ kind: 'success', text: 'Đã hoàn thành task' });
    await settle();
    expect(shadow(el).querySelector('[part="toast"]')?.textContent).toContain('Đã hoàn thành task');
    expect(shadow(el).querySelector('[role="region"]')?.getAttribute('aria-label')).toBe('Thông báo');
    vi.advanceTimersByTime(4500);
    await settle();
    expect(shadow(el).querySelector('[part="toast"]')).toBeNull();
  });

  it('keeps an error toast and reports its action', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    document.body.innerHTML = '';
    const el = document.createElement('af-toast') as ToastEl;
    document.body.append(el);
    await settle();
    const id = el.show({ kind: 'error', text: 'Không lưu được', action: { id: 'retry', label: 'Thử lại' } });
    vi.advanceTimersByTime(10_000);
    await settle();
    const seen: unknown[] = [];
    el.addEventListener('action', (e) => seen.push((e as CustomEvent).detail));
    (shadow(el).querySelector('[part="action"]') as HTMLElement).click();
    expect(seen).toEqual([{ toast: id, action: 'retry' }]);
    el.dismiss(id);
    vi.advanceTimersByTime(500);
    await settle();
    expect(shadow(el).querySelector('[part="toast"]')).toBeNull();
  });

  it('closes an error after eight seconds, not four', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    document.body.innerHTML = '';
    const el = document.createElement('af-toast') as ToastEl;
    document.body.append(el);
    await settle();
    el.show({ kind: 'error', text: 'Không lưu được' });
    await settle();
    vi.advanceTimersByTime(4500);
    await settle();
    expect(shadow(el).querySelector('[part="toast"]')).not.toBeNull();
    vi.advanceTimersByTime(4000);
    await settle();
    expect(shadow(el).querySelector('[part="toast"]')).toBeNull();
  });

  it('closes a success toast with an action on time: only an error waits for its action', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    document.body.innerHTML = '';
    const el = document.createElement('af-toast') as ToastEl;
    document.body.append(el);
    await settle();
    el.show({ kind: 'success', text: 'Đã xoá task', action: { id: 'undo', label: 'Hoàn tác' } });
    await settle();
    expect(shadow(el).querySelector('[part="toast"]')).not.toBeNull();
    vi.advanceTimersByTime(4500);
    await settle();
    expect(shadow(el).querySelector('[part="toast"]')).toBeNull();
  });

  it('raises its region into the top layer only while it holds a toast', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    document.body.innerHTML = '';
    const el = document.createElement('af-toast') as ToastEl;
    document.body.append(el);
    await settle();
    expect(el.dataset.raised).not.toBe('true');
    const id = el.show({ kind: 'error', text: 'Lỗi' });
    await settle();
    expect(el.dataset.raised).toBe('true');
    el.dismiss(id);
    vi.advanceTimersByTime(500);
    await settle();
    expect(el.dataset.raised).toBe('false');
  });

  it('reads each toast from a live region that is never inside the hidden popover, errors as an alert', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    document.body.innerHTML = '';
    const el = document.createElement('af-toast') as ToastEl;
    document.body.append(el);
    await settle();
    const status = shadow(el).querySelector('[role="status"]') as HTMLElement;
    const alert = shadow(el).querySelector('[role="alert"]') as HTMLElement;
    for (const live of [status, alert]) {
      expect(live).not.toBeNull();
      expect(live.closest('[popover]')).toBeNull();
      expect(live.textContent).toBe('');
    }
    const saved = el.show({ kind: 'success', text: 'Đã lưu' });
    await settle();
    expect(status.textContent).toBe('Đã lưu');
    expect(alert.textContent).toBe('');
    el.show({ kind: 'error', text: 'Không lưu được' });
    await settle();
    expect(alert.textContent).toBe('Không lưu được');
    expect(status.textContent).toBe('Đã lưu');
    el.dismiss(saved);
    vi.advanceTimersByTime(500);
    await settle();
    expect(status.textContent).toBe('');
    expect(shadow(el).querySelector('[role="region"]')?.getAttribute('aria-live')).toBe('off');
    expect(shadow(el).querySelector('[part="toast"]')?.getAttribute('aria-live')).toBe('off');
  });

  it('has show and dismiss before it connects, and shows a toast queued that early', async () => {
    document.body.innerHTML = '';
    const el = document.createElement('af-toast') as ToastEl;
    expect(typeof el.show).toBe('function');
    expect(typeof el.dismiss).toBe('function');
    const id = el.show({ kind: 'info', text: 'Sớm' });
    expect(typeof id).toBe('string');
    document.body.append(el);
    await settle();
    expect(shadow(el).querySelector('[part="toast"]')?.textContent).toContain('Sớm');
    expect(el.dataset.raised).toBe('true');
  });

  it('adds no key listener of its own to document or window, with or without a toast', async () => {
    const watch = watchDocumentKeyListeners();
    try {
      document.body.innerHTML = '';
      const el = document.createElement('af-toast') as ToastEl;
      document.body.append(el);
      await settle();
      expect(watch.fromKit()).toEqual([]);
      el.show({ kind: 'info', text: 'x' });
      await settle();
      expect(shadow(el).querySelector('[part="toast"]')).not.toBeNull();
      expect(watch.fromKit()).toEqual([]);
    } finally {
      watch.restore();
    }
  });

  it('leaves the host page keys alone: no focus move and no preventDefault', async () => {
    document.body.innerHTML = '<input id="outside">';
    const input = document.getElementById('outside') as HTMLInputElement;
    const el = document.createElement('af-toast') as ToastEl;
    document.body.append(el);
    await settle();
    el.show({ kind: 'error', text: 'x' });
    await settle();
    input.focus();
    for (const init of [{ key: 'a', code: 'KeyA' }, { key: 't', code: 'KeyT', altKey: true }, { key: 'Alt', code: 'AltLeft', altKey: true }]) {
      const event = new KeyboardEvent('keydown', { ...init, bubbles: true, composed: true, cancelable: true });
      input.dispatchEvent(event);
      await settle();
      expect(event.defaultPrevented).toBe(false);
      expect(document.activeElement).toBe(input);
    }
  });

  it('removes a toast that is dismissed in the same tick it is shown', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    document.body.innerHTML = '';
    const el = document.createElement('af-toast') as ToastEl;
    document.body.append(el);
    await settle();
    el.dismiss(el.show({ kind: 'error', text: 'x' }));
    vi.advanceTimersByTime(500);
    await settle();
    expect(shadow(el).querySelector('[part="toast"]')).toBeNull();
  });

  it('reports an action click once and dismisses that toast', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    document.body.innerHTML = '';
    const el = document.createElement('af-toast') as ToastEl;
    document.body.append(el);
    await settle();
    const id = el.show({ kind: 'error', text: 'x', action: { id: 'retry', label: 'Retry' } });
    await settle();
    const seen: unknown[] = [];
    el.addEventListener('action', (e) => seen.push((e as CustomEvent).detail));
    (shadow(el).querySelector('[part="action"]') as HTMLElement).click();
    vi.advanceTimersByTime(500);
    await settle();
    expect(seen).toEqual([{ toast: id, action: 'retry' }]);
    expect(shadow(el).querySelector('[part="toast"]')).toBeNull();
  });
});
