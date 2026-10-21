import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { G_CHORD_MS } from '../model/timing.js';
import { keyAction, type KeyAction } from './keymap.js';

export type Handlers = Partial<Record<KeyAction, () => void>>;
export interface Command {
  id: string;
  label: string;
  hint?: string;
  section: 'ticket' | 'go';
  /** The ticket section's heading, such as "Actions on TK-2026-0418". */
  title?: string;
  run(): void;
}
type Overlay = 'palette' | 'help' | null;

interface Keyboard {
  register(lookup: () => Handlers): () => void;
  registerCommands(lookup: () => Command[]): () => void;
  commands(): Command[];
  overlay: Overlay;
  setOverlay(o: Overlay): void;
}

const KeyboardContext = createContext<Keyboard | null>(null);

/**
 * Where the desk hears keys: the shadow root it renders in, or its own element outside one. Never the document:
 * a key typed in the host's own page is not the desk's.
 */
export type KeyScope = ShadowRoot | HTMLElement;

/** What has focus inside `scope`. A shadow root says so itself; the document would say the shadow's host element. */
function focusedIn(scope: KeyScope): HTMLElement | null {
  const active = scope instanceof ShadowRoot ? scope.activeElement : scope.ownerDocument.activeElement;
  if (!(active instanceof HTMLElement)) return null;
  return scope instanceof ShadowRoot || scope.contains(active) ? active : null;
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

/** Something that takes Enter itself: pressing it must press the control, not open the selected ticket. */
const TAKES_ENTER = 'button, a[href], [role="menuitem"], summary';
const takesEnter = (target: EventTarget | null) => target instanceof Element && target.closest(TAKES_ENTER) !== null;

export function KeyboardProvider({ scope, children }: { scope: KeyScope; children: ReactNode }) {
  // Read by `setOverlay`, which is built once.
  const scopeRef = useRef(scope);
  scopeRef.current = scope;
  const [overlay, setOverlayState] = useState<Overlay>(null);
  // Read by the key listener and by `setOverlay`, which must not change identity with it (see `registry`).
  const overlayRef = useRef(overlay);
  overlayRef.current = overlay;
  // Whatever had focus when an overlay opened, so closing it puts the person back where they were.
  const opener = useRef<HTMLElement | null>(null);

  // Registering is built once: a handler that mounts later must stay behind the ones that mounted before it
  // ("the composer over the ticket over the queue"), and a registry that changed with the overlay would re-run
  // every component's registering effect, children first, and shuffle that order.
  const [registry] = useState(() => {
    const handlers: { current: (() => Handlers)[] } = { current: [] };
    const commands: { current: (() => Command[])[] } = { current: [] };
    return {
      handlers,
      register(lookup: () => Handlers) {
        handlers.current.push(lookup);
        return () => { handlers.current = handlers.current.filter((l) => l !== lookup); };
      },
      registerCommands(lookup: () => Command[]) {
        commands.current.push(lookup);
        return () => { commands.current = commands.current.filter((l) => l !== lookup); };
      },
      commands: () => commands.current.flatMap((l) => l()),
    };
  });

  const [setOverlay] = useState(() => (next: Overlay) => {
    if (next !== null && overlayRef.current === null) {
      opener.current = focusedIn(scopeRef.current);
    }
    if (next === null) {
      const back = opener.current;
      opener.current = null;
      if (back?.isConnected) back.focus();
    }
    overlayRef.current = next;
    setOverlayState(next);
  });

  useEffect(() => {
    let afterG = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    function onKey(event: Event) {
      const e = event as KeyboardEvent;
      // Something closer to the key (a menu, a text box) has already dealt with it.
      if (e.defaultPrevented) return;
      // The element the key was typed in. The path is not retargeted, so a field in a shadow root, this one or one
      // nested in it, still reads as typing.
      const target = e.composedPath()[0] ?? e.target;
      const action = keyAction(e, { typing: isTyping(target), afterG });
      afterG = false;
      if (action === 'g') {
        afterG = true;
        clearTimeout(timer);
        timer = setTimeout(() => { afterG = false; }, G_CHORD_MS);
        return;
      }
      if (!action) return;
      if (action === 'palette') {
        e.preventDefault();
        setOverlay('palette');
        return;
      }
      if (overlayRef.current) {
        if (action === 'escape') setOverlay(null);
        return; // the open overlay owns the keyboard
      }
      if (action === 'help') {
        setOverlay('help');
        return;
      }
      if (action === 'open' && takesEnter(target)) return;
      // The most recently mounted handler for this action wins: the composer over the ticket over the queue.
      for (let i = registry.handlers.current.length - 1; i >= 0; i--) {
        const h = registry.handlers.current[i]!()[action];
        if (h) {
          e.preventDefault();
          h();
          return;
        }
      }
    }
    const hearing: EventTarget = scope;
    hearing.addEventListener('keydown', onKey);
    return () => {
      hearing.removeEventListener('keydown', onKey);
      clearTimeout(timer);
    };
  }, [registry, setOverlay, scope]);

  const value = useMemo<Keyboard>(() => ({
    register: registry.register,
    registerCommands: registry.registerCommands,
    commands: registry.commands,
    overlay,
    setOverlay,
  }), [registry, overlay, setOverlay]);

  return <KeyboardContext.Provider value={value}>{children}</KeyboardContext.Provider>;
}

function useKeyboard() {
  const kb = useContext(KeyboardContext);
  if (!kb) throw new Error('outside KeyboardProvider');
  return kb;
}

/** Registers key handlers for as long as the component is mounted; always calls the latest ones. */
export function useKeys(handlers: Handlers) {
  const { register } = useKeyboard();
  const latest = useRef(handlers);
  latest.current = handlers;
  useEffect(() => register(() => latest.current), [register]);
}

export function useCommands(commands: Command[]) {
  const { registerCommands } = useKeyboard();
  const latest = useRef(commands);
  latest.current = commands;
  useEffect(() => registerCommands(() => latest.current), [registerCommands]);
}

export function useOverlays() {
  const kb = useKeyboard();
  return {
    palette: kb.overlay === 'palette',
    help: kb.overlay === 'help',
    open: (which: 'palette' | 'help') => kb.setOverlay(which),
    close: () => kb.setOverlay(null),
    commands: kb.commands,
  };
}
