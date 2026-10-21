import type { AfRichEditorElement, AfToastElement } from '@reflexify/agentflow-elements/jsx';
import type { KitStrings, MenuItem, Person, ToastInput } from '@reflexify/agentflow-elements/kit';
import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { useElement } from './use-element.js';

export type { MenuItem, Person };

type Strings = Partial<KitStrings> | null;
export type ThemeMode = 'light' | 'dark';

const ThemeContext = createContext<ThemeMode>('light');
/**
 * The host's theme, said by every kit element below as `data-theme`: each draws in a shadow root of its own, where the
 * kit's dark rules read `:host([data-theme="dark"])` on the element itself.
 */
export function KitTheme(p: { mode: ThemeMode; children?: ReactNode }) {
  return <ThemeContext.Provider value={p.mode}>{p.children}</ThemeContext.Provider>;
}
const useTheme = () => useContext(ThemeContext);
/** A slot's content sits in a wrapper that takes no box of its own. */
const SLOT = { display: 'contents' } as const;

export function Dialog(p: {
  open: boolean; heading: string; locale: string; strings?: Strings;
  onClose(detail: { reason: 'escape' | 'outside' | 'close-button' }): void;
  children?: ReactNode; actions?: ReactNode;
}) {
  const theme = useTheme();
  const ref = useElement<HTMLElement>({ open: p.open, heading: p.heading, locale: p.locale, strings: p.strings ?? null }, { close: p.onClose });
  return (
    <af-dialog ref={ref} data-theme={theme}>
      {p.children}
      {/* Rendered only when there is something to show: the dialog hides its footer while nothing is assigned to the slot. */}
      {p.actions !== undefined && <div slot="actions" style={SLOT}>{p.actions}</div>}
    </af-dialog>
  );
}

export function Confirm(p: {
  open: boolean; heading: string; message?: string; confirmLabel: string; danger?: boolean; impact?: string | null; busy?: boolean;
  locale: string; strings?: Strings; onConfirm(): void; onCancel(detail: { reason: 'escape' | 'close-button' }): void;
}) {
  const busy = !!p.busy;
  const theme = useTheme();
  const ref = useElement<HTMLElement>(
    { open: p.open, heading: p.heading, message: p.message ?? '', confirmLabel: p.confirmLabel, danger: !!p.danger, impact: p.impact ?? null, locale: p.locale, strings: p.strings ?? null },
    { confirm: p.onConfirm, cancel: p.onCancel },
  );
  // The element stays locked after a press until busy has been seen true and then false. It sees a value only after a
  // flush of its own, so true is written at once and false one microtask later: a true that React renders and clears
  // again in the same task must not collapse into no change.
  useLayoutEffect(() => {
    const el = ref.current as (HTMLElement & { busy: boolean }) | null;
    if (!el) return;
    if (busy) {
      el.busy = true;
      return;
    }
    let live = true;
    queueMicrotask(() => {
      if (live) el.busy = false;
    });
    return () => {
      live = false;
    };
  }, [busy, ref]);
  return <af-confirm ref={ref} data-theme={theme} />;
}

export function Menu(p: { items: MenuItem[]; label: string; locale: string; strings?: Strings; onSelect(detail: { id: string }): void; children?: ReactNode }) {
  const theme = useTheme();
  const ref = useElement<HTMLElement>({ items: p.items, label: p.label, locale: p.locale, strings: p.strings ?? null }, { select: p.onSelect });
  return <af-menu ref={ref} data-theme={theme}>{p.children}</af-menu>;
}

export function Popover(p: {
  open: boolean; placement?: string; locale: string; strings?: Strings;
  onClose(detail: { reason: 'escape' | 'outside' }): void; anchor: ReactNode; content: ReactNode;
}) {
  const theme = useTheme();
  const ref = useElement<HTMLElement>({ open: p.open, placement: p.placement ?? 'bottom-start', locale: p.locale, strings: p.strings ?? null }, { close: p.onClose });
  return (
    <af-popover ref={ref} data-theme={theme}>
      <div slot="anchor" style={SLOT}>{p.anchor}</div>
      <div slot="content" style={SLOT}>{p.content}</div>
    </af-popover>
  );
}

/** Whether the first element of `box` shows less than its text: cut at the end of a line, or clamped to fewer lines. */
function cutShort(box: HTMLElement): boolean {
  const el = box.firstElementChild;
  return !!el && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
}

/**
 * `af-tooltip` around `children`, mounted only once the pointer first comes over them or focus first lands in them: a
 * board of two thousand cards would otherwise build thousands of shadow roots nobody hovers. Until then a plain span
 * stands in its place, with the same `tip` class for the layout. The children render into one container that moves
 * from the span into the element, so they keep their nodes and their state, and focus stays where it was. With
 * `whenCutShort` it mounts only while the text it repeats is cut short, so a title shown whole says nothing twice.
 */
export function Tooltip(p: { text: string; locale: string; strings?: Strings; className?: string; whenCutShort?: boolean; children?: ReactNode }) {
  const ref = useElement<HTMLElement>({ text: p.text, locale: p.locale, strings: p.strings ?? null }, {});
  const stand = useRef<HTMLSpanElement>(null);
  const [box] = useState(() => {
    const el = document.createElement('span');
    // The element's own anchor is a block around its slot: this stands for it before the element exists.
    el.style.display = 'block';
    return el;
  });
  const [armed, setArmed] = useState(false);
  // The focus inside the children when they move: the stand-in leaves the page with them before the move.
  const refocus = useRef<HTMLElement | null>(null);
  // The pointer event that armed the tooltip, to say again once the element can hear it.
  const arrival = useRef<{ event: PointerEvent; target: EventTarget | null } | null>(null);
  const whenCutShort = !!p.whenCutShort;
  const theme = useTheme();

  useLayoutEffect(() => {
    const el = stand.current;
    if (armed || !el) return;
    const arm = (e: Event) => {
      if (whenCutShort && !cutShort(box)) return;
      const focused = (el.getRootNode() as Document | ShadowRoot).activeElement;
      refocus.current = focused instanceof HTMLElement && box.contains(focused) ? focused : null;
      // The target is read now: once dispatch is over, an event that crossed a shadow root no longer says it.
      arrival.current = e instanceof PointerEvent ? { event: e, target: e.composedPath()[0] ?? null } : null;
      setArmed(true);
    };
    // The children move as the pointer arrives, before any press: moved between a press and its release, the press's
    // node leaves the page and the browser sends the click nowhere. Focus can arrive inside React's own commit, which
    // cannot be flushed, and the move keeps the focus anyway.
    const armNow = (e: Event) => flushSync(() => arm(e));
    el.addEventListener('pointerover', armNow);
    el.addEventListener('focusin', arm);
    return () => {
      el.removeEventListener('pointerover', armNow);
      el.removeEventListener('focusin', arm);
    };
  }, [armed, box, whenCutShort]);

  useLayoutEffect(() => {
    const parent = armed ? ref.current : stand.current;
    if (!parent || box.parentNode === parent) return;
    parent.appendChild(box);
    const arrived = arrival.current;
    arrival.current = null;
    const came = arrived?.event;
    const keep = refocus.current;
    refocus.current = null;
    const undo: (() => void)[] = [];
    if (came) {
      // The element renders its trigger a microtask after it connects. Chromium sends the rest of the arriving move
      // to it; WebKit has already aimed it at the stand-in, so the tooltip would wait for the pointer to move again.
      // Unless the pointer has left by then, its arrival is said once more where the trigger can hear it.
      let left = false;
      const leave = () => { left = true; };
      box.addEventListener('pointerleave', leave);
      const again = setTimeout(() => {
        box.removeEventListener('pointerleave', leave);
        // Only an arrival on the children themselves, which is where a real pointer lands, not one aimed at the stand-in.
        const target = arrived!.target instanceof Node && box.contains(arrived!.target) ? arrived!.target : null;
        if (left || !target) return;
        target.dispatchEvent(new PointerEvent('pointerover', {
          bubbles: true, composed: true, pointerType: came.pointerType || 'mouse', pointerId: came.pointerId, isPrimary: came.isPrimary,
          clientX: came.clientX, clientY: came.clientY,
        }));
      }, 0);
      undo.push(() => {
        clearTimeout(again);
        box.removeEventListener('pointerleave', leave);
      });
    }
    // A pointer can arm the tooltip while focus is already inside it; the move takes the focus along all the same.
    if (keep && box.contains(keep)) {
      const focused = () => (keep.getRootNode() as Document | ShadowRoot).activeElement === keep;
      keep.focus({ preventScroll: true });
      // The element renders its slot a microtask after it connects, and until then its children have no box and cannot
      // take focus. Once it has, the focus that armed it found no tooltip to open, so it is said again.
      let live = true;
      queueMicrotask(() => {
        if (live && !focused() && keep.isConnected) keep.focus({ preventScroll: true });
      });
      const again = setTimeout(() => {
        if (!came && focused()) keep.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }));
      }, 0);
      undo.push(() => {
        live = false;
        clearTimeout(again);
      });
    }
    return () => undo.forEach((fn) => fn());
  }, [armed, box, ref]);

  const className = p.className ? `tip ${p.className}` : 'tip';
  return (
    <>
      {armed ? <af-tooltip ref={ref} className={className} data-theme={theme} /> : <span ref={stand} className={className} />}
      {createPortal(p.children, box)}
    </>
  );
}

export function DateInput(p: {
  value: string | null; min?: string | null; max?: string | null; clearable?: boolean; placeholder?: string | null; disabled?: boolean;
  /** The field's visible label, which the element names its control by. */
  label?: string | null;
  locale: string; strings?: Strings; onChange(detail: { value: string | null }): void;
}) {
  const theme = useTheme();
  const ref = useElement<HTMLElement>(
    {
      value: p.value, min: p.min ?? null, max: p.max ?? null, clearable: !!p.clearable, placeholder: p.placeholder ?? null, disabled: !!p.disabled,
      label: p.label ?? null, locale: p.locale, strings: p.strings ?? null,
    },
    { change: p.onChange },
  );
  return <af-date ref={ref} data-theme={theme} />;
}

export function PersonPicker(p: {
  people: Person[]; value: string | string[] | null; multiple?: boolean; placeholder?: string | null; disabled?: boolean;
  /** The field's visible label, which the element names its control by. */
  label?: string | null;
  /** The people are still being read: a value not among them shows as pending, not as someone unknown. */
  loading?: boolean;
  locale: string; strings?: Strings; onChange(detail: { value: string | string[] | null }): void; onSearch?(detail: { query: string }): void;
}) {
  const theme = useTheme();
  const ref = useElement<HTMLElement>(
    {
      people: p.people, value: p.value, multiple: !!p.multiple, placeholder: p.placeholder ?? null, disabled: !!p.disabled, label: p.label ?? null,
      loading: !!p.loading, locale: p.locale, strings: p.strings ?? null,
    },
    { change: p.onChange, search: p.onSearch },
  );
  return <af-person-picker ref={ref} data-theme={theme} />;
}

export function RichEditor(p: {
  value: string; readonly?: boolean; placeholder?: string | null;
  /** The field's visible label, which the element names its editor by. */
  label?: string | null;
  locale: string; strings?: Strings; onChange(detail: { value: string }): void;
}) {
  const theme = useTheme();
  const ref = useElement<AfRichEditorElement>(
    { value: p.value, readonly: !!p.readonly, placeholder: p.placeholder ?? null, label: p.label ?? null, locale: p.locale, strings: p.strings ?? null },
    { change: p.onChange },
  );
  return <af-rich-editor ref={ref} data-theme={theme} />;
}

export type ModuleToast = { kind: 'success' | 'error' | 'info'; text: string; action?: { label: string; onSelect(): void } };

const ToastContext = createContext<((input: ModuleToast) => void) | null>(null);
/** Toasts are remembered only to find their action again; the oldest are forgotten past this many. */
const REMEMBERED = 50;

export function useToast(): (input: ModuleToast) => void {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast outside ToastRegion');
  return show;
}

/** One `af-toast` for the module, and `useToast` below it. An action's callback is kept by toast id until the element reports the press. */
export function ToastRegion(p: { locale: string; strings?: Strings; children?: ReactNode }) {
  const theme = useTheme();
  const actions = useRef(new Map<string, () => void>());
  const ref = useElement<AfToastElement>(
    { locale: p.locale, strings: p.strings ?? null },
    {
      action: (detail: { toast: string }) => {
        const onSelect = actions.current.get(detail.toast);
        actions.current.delete(detail.toast);
        onSelect?.();
      },
    },
  );
  const show = useCallback((input: ModuleToast) => {
    const toast: ToastInput = { kind: input.kind, text: input.text, ...(input.action ? { action: { id: 'action', label: input.action.label } } : {}) };
    // The element gets its methods when it connects, a moment after React attaches it, and the ref is set only after
    // the first layout effects, so a toast raised that early waits for both.
    const send = (tries: number) => {
      const el = ref.current;
      if (!el || typeof el.show !== 'function') {
        if (tries > 0) setTimeout(() => send(tries - 1), 0);
        else console.error('A toast was dropped: the toast element never became ready.');
        return;
      }
      const id = el.show(toast);
      if (input.action) {
        actions.current.set(id, input.action.onSelect);
        for (const old of [...actions.current.keys()].slice(0, Math.max(0, actions.current.size - REMEMBERED))) actions.current.delete(old);
      }
    };
    send(10);
  }, [ref]);
  return (
    <ToastContext.Provider value={show}>
      {p.children}
      <af-toast ref={ref} data-theme={theme} />
    </ToastContext.Provider>
  );
}
