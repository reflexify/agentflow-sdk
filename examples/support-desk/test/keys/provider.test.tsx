// @vitest-environment jsdom
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { useState, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { KeyboardProvider, useCommands, useKeys, useOverlays } from '../../src/keys/KeyboardProvider.js';

function Probe(props: { name: string; onNext?: () => void; onReply?: () => void; onEscape?: () => void; onOpen?: () => void }) {
  useKeys({ next: props.onNext, reply: props.onReply, escape: props.onEscape, open: props.onOpen });
  return <p>{props.name}</p>;
}

function Overlays() {
  const o = useOverlays();
  return <p data-testid="o">{o.palette ? 'palette' : o.help ? 'help' : 'none'}</p>;
}

const press = (key: string, init: KeyboardEventInit = {}, target: Element = document.body) => fireEvent.keyDown(target, { key, ...init });

describe('the keyboard provider', () => {
  it('gives a key to the most recently mounted handler that wants it', () => {
    const queue = vi.fn();
    const ticket = vi.fn();
    const composer = vi.fn();
    function App() {
      const [composing, setComposing] = useState(false);
      return (
        <KeyboardProvider scope={document.body}>
          <Probe name="queue" onNext={queue} />
          <Probe name="ticket" onNext={ticket} onReply={() => setComposing(true)} />
          {composing && <Probe name="composer" onNext={composer} />}
        </KeyboardProvider>
      );
    }
    render(<App />);
    press('j');
    expect([queue.mock.calls.length, ticket.mock.calls.length, composer.mock.calls.length]).toEqual([0, 1, 0]);
    press('r');
    press('j');
    expect([queue.mock.calls.length, ticket.mock.calls.length, composer.mock.calls.length]).toEqual([0, 1, 1]);
  });

  it('falls through to an earlier handler when a later one does not want the key', () => {
    const queue = vi.fn();
    render(<KeyboardProvider scope={document.body}><Probe name="a" onNext={queue} /><Probe name="b" onReply={() => {}} /></KeyboardProvider>);
    press('j');
    expect(queue).toHaveBeenCalledOnce();
  });

  it('stops calling a handler once its component unmounts', () => {
    const next = vi.fn();
    const { rerender } = render(<KeyboardProvider scope={document.body}><Probe name="a" onNext={next} /></KeyboardProvider>);
    rerender(<KeyboardProvider scope={document.body}>{null}</KeyboardProvider>);
    press('j');
    expect(next).not.toHaveBeenCalled();
  });

  it('leaves single keys alone while someone types in a field', () => {
    const next = vi.fn();
    render(<KeyboardProvider scope={document.body}><Probe name="a" onNext={next} /><input aria-label="field" /></KeyboardProvider>);
    press('j', {}, screen.getByLabelText('field'));
    expect(next).not.toHaveBeenCalled();
  });

  it('lets the open overlay own the keyboard, and closes it on Escape before anyone else hears it', () => {
    const next = vi.fn();
    const escape = vi.fn();
    render(<KeyboardProvider scope={document.body}><Probe name="a" onNext={next} onEscape={escape} /><Overlays /></KeyboardProvider>);
    press('?');
    expect(screen.getByTestId('o').textContent).toBe('help');
    press('j');
    press('Escape');
    expect(next).not.toHaveBeenCalled();
    expect(escape).not.toHaveBeenCalled();
    expect(screen.getByTestId('o').textContent).toBe('none');
    press('Escape');
    expect(escape).toHaveBeenCalledOnce();
  });

  it('leaves Enter to a button, a link or a menu item that has focus, instead of opening the ticket', () => {
    const open = vi.fn();
    render(
      <KeyboardProvider scope={document.body}>
        <Probe name="a" onOpen={open} />
        <button>Press</button>
        <a href="/somewhere">Link</a>
        <div role="menuitem" tabIndex={0}>Item</div>
        <details><summary>More</summary></details>
        <span><button><b>Inner</b></button></span>
      </KeyboardProvider>,
    );
    for (const target of [
      screen.getByRole('button', { name: 'Press' }), screen.getByRole('link'), screen.getByRole('menuitem'),
      screen.getByText('More'), screen.getByText('Inner'),
    ]) {
      // `true` is "not cancelled": the browser still presses the button.
      expect(fireEvent.keyDown(target, { key: 'Enter' })).toBe(true);
    }
    expect(open).not.toHaveBeenCalled();
  });

  it('still opens on Enter when nothing that takes Enter has focus', () => {
    const open = vi.fn();
    render(<KeyboardProvider scope={document.body}><Probe name="a" onOpen={open} /><div role="option" tabIndex={0} aria-selected>Row</div></KeyboardProvider>);
    expect(fireEvent.keyDown(screen.getByRole('option'), { key: 'Enter' })).toBe(false);
    expect(open).toHaveBeenCalledOnce();
    press('Enter');
    expect(open).toHaveBeenCalledTimes(2);
  });

  it('leaves a key alone when something else has already handled it', () => {
    const next = vi.fn();
    render(
      <KeyboardProvider scope={document.body}>
        <Probe name="a" onNext={next} />
        <div tabIndex={0} data-testid="owner" onKeyDown={(e) => e.preventDefault()} />
      </KeyboardProvider>,
    );
    press('j', {}, screen.getByTestId('owner'));
    expect(next).not.toHaveBeenCalled();
    press('j');
    expect(next).toHaveBeenCalledOnce();
  });

  it('keeps handlers in the order they mounted when an overlay opens and closes', () => {
    const outer = vi.fn();
    const inner = vi.fn();
    function Late() {
      const [shown, setShown] = useState(false);
      return (
        <>
          <button onClick={() => setShown(true)}>Show</button>
          {shown && <Probe name="late" onNext={inner} />}
        </>
      );
    }
    // The outer one is a parent of the late one: a re-registration in effect order (children first) would put it last.
    function Outer({ children }: { children: ReactNode }) {
      useKeys({ next: outer });
      return <>{children}</>;
    }
    render(<KeyboardProvider scope={document.body}><Outer><Late /></Outer><Overlays /></KeyboardProvider>);
    fireEvent.click(screen.getByText('Show'));
    press('j');
    expect([outer.mock.calls.length, inner.mock.calls.length]).toEqual([0, 1]);
    press('?');
    expect(screen.getByTestId('o').textContent).toBe('help');
    press('Escape');
    expect(screen.getByTestId('o').textContent).toBe('none');
    press('j');
    expect([outer.mock.calls.length, inner.mock.calls.length]).toEqual([0, 2]);
  });

  it('does not try to give focus back to something that has gone from the page', () => {
    function App({ withButton }: { withButton: boolean }) {
      return <KeyboardProvider scope={document.body}>{withButton && <button>Opener</button>}<Overlays /></KeyboardProvider>;
    }
    const { rerender } = render(<App withButton />);
    const opener = screen.getByRole('button', { name: 'Opener' });
    opener.focus();
    press('?', {}, opener);
    expect(screen.getByTestId('o').textContent).toBe('help');
    rerender(<App withButton={false} />);
    press('Escape');
    expect(screen.getByTestId('o').textContent).toBe('none');
    expect(document.activeElement).toBe(document.body);
  });

  it('opens the palette on ⌘K even from a field', () => {
    render(<KeyboardProvider scope={document.body}><input aria-label="field" /><Overlays /></KeyboardProvider>);
    press('k', { metaKey: true }, screen.getByLabelText('field'));
    expect(screen.getByTestId('o').textContent).toBe('palette');
  });

  it('waits for the letter after G, but not forever', () => {
    vi.useFakeTimers();
    try {
      const go = vi.fn();
      function Go() {
        useKeys({ goHeld: go });
        return null;
      }
      render(<KeyboardProvider scope={document.body}><Go /></KeyboardProvider>);
      press('g');
      act(() => { vi.advanceTimersByTime(1300); });
      press('h');
      expect(go).not.toHaveBeenCalled();
      press('g');
      press('h');
      expect(go).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });

  it('lists the commands of every mounted component, and no more after one unmounts', () => {
    let read!: () => string[];
    function Cmds({ id }: { id: string }) {
      useCommands([{ id, label: id, section: 'ticket', run: () => {} }]);
      return null;
    }
    function Reader() {
      const o = useOverlays();
      read = () => o.commands().map((c) => c.id);
      return null;
    }
    const { rerender } = render(<KeyboardProvider scope={document.body}><Cmds id="a" /><Cmds id="b" /><Reader /></KeyboardProvider>);
    expect(read()).toEqual(['a', 'b']);
    rerender(<KeyboardProvider scope={document.body}><Cmds id="a" /><Reader /></KeyboardProvider>);
    expect(read()).toEqual(['a']);
  });
});

describe('inside a shadow root', () => {
  afterEach(() => document.body.replaceChildren());

  /** A module's place on a page: a host element with an open shadow root, and the module's own element inside it. */
  function shadowed() {
    const host = document.body.appendChild(document.createElement('div'));
    const shadow = host.attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    shadow.append(container);
    return { shadow, container, inside: within(container) };
  }

  it('reads the field a key was typed in through the shadow root: typing starts no shortcut', () => {
    const next = vi.fn();
    const { shadow, container, inside } = shadowed();
    render(<KeyboardProvider scope={shadow}><Probe name="a" onNext={next} /><input aria-label="field" /></KeyboardProvider>, { container });
    press('j', {}, inside.getByLabelText('field'));
    expect(next).not.toHaveBeenCalled();
    press('j', {}, inside.getByText('a'));
    expect(next).toHaveBeenCalledOnce();
  });

  it('hears nothing typed outside its shadow root', () => {
    const next = vi.fn();
    const { shadow, container } = shadowed();
    const outside = document.body.appendChild(document.createElement('input'));
    render(<KeyboardProvider scope={shadow}><Probe name="a" onNext={next} /><Overlays /></KeyboardProvider>, { container });
    press('j', {}, outside);
    press('j');
    press('?');
    expect(next).not.toHaveBeenCalled();
    expect(within(container).getByTestId('o').textContent).toBe('none');
  });

  it('gives focus back to what had it inside the shadow root when an overlay closes', () => {
    const { shadow, container, inside } = shadowed();
    render(
      <KeyboardProvider scope={shadow}><button>Opener</button><input aria-label="search" /><Overlays /></KeyboardProvider>,
      { container },
    );
    const opener = inside.getByRole('button', { name: 'Opener' });
    opener.focus();
    press('?', {}, opener);
    expect(inside.getByTestId('o').textContent).toBe('help');
    const search = inside.getByLabelText('search');
    search.focus();
    press('Escape', {}, search);
    expect(inside.getByTestId('o').textContent).toBe('none');
    expect(shadow.activeElement).toBe(opener);
  });
});
