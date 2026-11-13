import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../src/kit/index.js';
import { settle, shadow, watchDocumentKeyListeners } from '../support.js';

type Recorded = { __value?: unknown; __validity?: ValidityStateFlags };
type PadEl = HTMLElement & { value: string | null; clear(): void; internals: Recorded };

const SIGNED = 'data:image/png;base64,c2lnbmVk';
const DRAWN = 'data:image/png;base64,ZHJhd24=';

async function pad(attributes: Record<string, string> = {}, value: string | null = null) {
  document.body.innerHTML = '';
  const el = document.createElement('af-signature-pad') as PadEl;
  for (const [name, v] of Object.entries(attributes)) el.setAttribute(name, v);
  el.value = value;
  document.body.append(el);
  await settle();
  return el;
}
const part = (el: Element, name: string) => shadow(el).querySelector<HTMLElement>(`[part~="${name}"]`);
const heard = (el: HTMLElement) => {
  const seen: unknown[] = [];
  el.addEventListener('change', (e) => seen.push((e as CustomEvent).detail));
  return seen;
};

// jsdom draws nothing: the export's image never loads and its canvas has no context, so both are stood in for.
function stubExport() {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(DRAWN);
  vi.stubGlobal('Image', class {
    onload: (() => void) | null = null;
    set src(_: string) { queueMicrotask(() => this.onload?.()); }
  });
}

// A press on the control, a drag across it, and a release, as a mouse makes them. Zag follows the pointer on the document
// from the effect the press starts, so the drag waits for it.
async function stroke(control: HTMLElement) {
  const at = (type: string, x: number, buttons: number) =>
    new PointerEvent(type, { bubbles: true, composed: true, button: 0, buttons, pointerId: 1, pointerType: 'mouse', clientX: x, clientY: 40 });
  control.dispatchEvent(at('pointerdown', 20, 1));
  await settle();
  for (const x of [40, 60, 80, 100, 120]) document.dispatchEvent(at('pointermove', x, 1));
  document.dispatchEvent(at('pointerup', 120, 0));
  await settle();
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('<af-signature-pad>', () => {
  it('names its control by label, and draws its segment and guide', async () => {
    const el = await pad({ label: 'Approver signature' });
    expect(part(el, 'control')!.getAttribute('aria-label')).toBe('Approver signature');
    expect(part(el, 'segment')).not.toBeNull();
    expect(part(el, 'guide')).not.toBeNull();
    expect(part(el, 'hint')!.textContent).toBe('Use your mouse or finger to sign. Click Clear to start over.');
    expect(part(el, 'image')).toBeNull();

    const vi_ = await pad({ locale: 'vi' });
    expect(part(vi_, 'control')!.getAttribute('aria-label')).toBe('Chữ ký');
    expect(part(vi_, 'clear')!.textContent).toBe('Xoá');
    expect(part(vi_, 'hint')!.textContent).toBe('Dùng chuột hoặc ngón tay để ký. Bấm Xoá để ký lại.');
  });

  it('shows value as its image, and clear() empties it with change null', async () => {
    const el = await pad({}, SIGNED);
    expect(part(el, 'image')!.getAttribute('src')).toBe(SIGNED);
    const changes = heard(el);
    el.clear();
    await settle();
    expect(changes).toEqual([{ value: null }]);
    expect(part(el, 'image')).toBeNull();
    // A value the page sets after the clear is shown again.
    el.value = null;
    await settle();
    el.value = SIGNED;
    await settle();
    expect(part(el, 'image')!.getAttribute('src')).toBe(SIGNED);
  });

  it('reports nothing for clear() when there is nothing to clear, or the pad is read-only', async () => {
    const empty = await pad();
    const none = heard(empty);
    empty.clear();
    await settle();
    expect(none).toEqual([]);

    const fixed = await pad({ readonly: '' }, SIGNED);
    const kept = heard(fixed);
    fixed.clear();
    await settle();
    expect(kept).toEqual([]);
    expect(part(fixed, 'image')!.getAttribute('src')).toBe(SIGNED);

    // Strokes on the pad are something to clear, whether or not the page holds a value.
    stubExport();
    const drawn = await pad();
    await stroke(part(drawn, 'control')!);
    const changes = heard(drawn);
    drawn.clear();
    await settle();
    expect(changes).toEqual([{ value: null }]);
  });

  it('empties the image with change null from its clear button', async () => {
    const el = await pad({}, SIGNED);
    const changes = heard(el);
    part(el, 'clear')!.click();
    await settle();
    expect(changes).toEqual([{ value: null }]);
    expect(part(el, 'image')).toBeNull();
  });

  it('shows value and nothing to draw with when readonly, as an image only when there is one', async () => {
    const el = await pad({ readonly: '', label: 'Approver signature' }, SIGNED);
    expect(part(el, 'image')!.getAttribute('src')).toBe(SIGNED);
    expect(part(el, 'control')).toBeNull();
    expect(part(el, 'clear')).toBeNull();
    const frame = shadow(el).querySelector('.frame')!;
    expect(frame.getAttribute('role')).toBe('img');
    expect(frame.getAttribute('aria-label')).toBe('Approver signature');

    const empty = await pad({ readonly: '', label: 'Approver signature' });
    const bare = shadow(empty).querySelector('.frame')!;
    expect(part(empty, 'image')).toBeNull();
    expect(bare.hasAttribute('role')).toBe(false);
    expect(bare.hasAttribute('aria-label')).toBe(false);
  });

  it("passes disabled to Ark's root", async () => {
    const el = await pad({ disabled: '' });
    expect(shadow(el).querySelector('[data-scope="signature-pad"][data-part="root"]')!.hasAttribute('data-disabled')).toBe(true);
    expect((part(el, 'clear') as HTMLButtonElement).disabled).toBe(true);
  });

  it('submits value while nothing is drawn, and is missing a value when required without one', async () => {
    const el = await pad({ name: 'signature', required: '' }, SIGNED);
    expect(el.internals.__value).toBe(SIGNED);
    expect(el.internals.__validity).toEqual({});

    const empty = await pad({ name: 'signature', required: '' });
    expect(empty.internals.__value).toBeNull();
    expect(empty.internals.__validity).toEqual({ valueMissing: true });
  });

  it('reports a PNG when a stroke ends, drops the image under it, and adds no key listener', async () => {
    stubExport();
    const watch = watchDocumentKeyListeners();
    try {
      const el = await pad({ name: 'signature' }, SIGNED);
      const changes = heard(el);
      await stroke(part(el, 'control')!);
      expect(changes).toHaveLength(1);
      expect((changes[0] as { value: string }).value).toMatch(/^data:image\/png/);
      expect(part(el, 'image')).toBeNull();
      expect(part(el, 'segment')!.querySelectorAll('path').length).toBeGreaterThan(0);
      // The ink is fixed, so the stored image looks the same in every reader's theme.
      expect(part(el, 'segment')!.style.fill).toMatch(/^(#0f172a|rgb\(15, 23, 42\))$/);
      expect(el.internals.__value).toBe(DRAWN);
      expect(watch.fromKit()).toEqual([]);
    } finally {
      watch.restore();
    }
  });

  it('reports nothing and submits no older drawing when a stroke’s export fails', async () => {
    stubExport();
    const el = await pad({ name: 'signature', required: '' });
    const changes = heard(el);
    await stroke(part(el, 'control')!);
    expect(el.internals.__value).toBe(DRAWN);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('Image', class {
      constructor() { throw new Error('no image'); }
    });
    await stroke(part(el, 'control')!);
    expect(changes).toHaveLength(1);
    expect(el.internals.__value).toBeNull();
    expect(el.internals.__validity).toEqual({ valueMissing: true });
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('stops waiting for an export that never finishes, warns, reports nothing and submits no older drawing', async () => {
    stubExport();
    const el = await pad({ name: 'signature', required: '' });
    const changes = heard(el);
    await stroke(part(el, 'control')!);
    expect(el.internals.__value).toBe(DRAWN);
    // Without an error or a load, as when the page's policy refuses a data: image, the export neither resolves nor rejects.
    vi.stubGlobal('Image', class {
      onload: (() => void) | null = null;
      set src(_: string) {}
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.useFakeTimers({ shouldAdvanceTime: true, toFake: ['setTimeout', 'clearTimeout'] });
    try {
      await stroke(part(el, 'control')!);
      expect(warn).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(60_000);
    } finally {
      vi.useRealTimers();
    }
    await settle();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(changes).toHaveLength(1);
    expect(el.internals.__value).toBeNull();
    expect(el.internals.__validity).toEqual({ valueMissing: true });
  });

  it('forgets an export that never finishes once a newer stroke has begun, and warns nothing for it', async () => {
    stubExport();
    const el = await pad({ name: 'signature' });
    const changes = heard(el);
    vi.stubGlobal('Image', class {
      onload: (() => void) | null = null;
      set src(_: string) {}
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.useFakeTimers({ shouldAdvanceTime: true, toFake: ['setTimeout', 'clearTimeout'] });
    try {
      await stroke(part(el, 'control')!);
      stubExport();
      await stroke(part(el, 'control')!);
      await vi.advanceTimersByTimeAsync(60_000);
    } finally {
      vi.useRealTimers();
    }
    await settle();
    expect(warn).not.toHaveBeenCalled();
    expect(changes).toHaveLength(1);
    expect(el.internals.__value).toBe(DRAWN);
  });

  it("empties its strokes on a form's reset, and asks once for the value it was written with", async () => {
    stubExport();
    const el = await pad({ name: 'signature' });
    await stroke(part(el, 'control')!);
    const changes = heard(el);
    (el as unknown as { formResetCallback(): void }).formResetCallback();
    await settle();
    expect(changes).toEqual([{ value: null }]);
    expect(part(el, 'segment')!.querySelectorAll('path')).toHaveLength(0);
  });
});
