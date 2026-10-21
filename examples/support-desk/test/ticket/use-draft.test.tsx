// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DeskError, type DeskApi } from '../../src/api/desk-api.js';
import { createFakeDesk } from '../../src/api/fake.js';
import { DEMO_PEOPLE } from '../../src/api/seed.js';
import { DeskProvider } from '../../src/data/desk-context.js';
import { useThread } from '../../src/data/hooks.js';
import { useDraft } from '../../src/ticket/composer/useDraft.js';
import { TEST_NOW } from '../support/render.js';

// The draft hook on its own, with no live layer: nothing is pushed, so only what the hook does itself shows.

const ANA = '30000000-0000-4000-8000-000000000002';
const DRAFT = '40000000-0000-4000-8000-000000000005';
const SLOW = { timeout: 3000 };

afterEach(() => {
  vi.useRealTimers();
  window.sessionStorage.clear();
});

function Harness(props: { onState?(d: ReturnType<typeof useDraft>): void }) {
  const replies = useThread(ANA).data?.replies;
  const d = useDraft(ANA, DEMO_PEOPLE.bo, replies);
  props.onState?.(d);
  return (
    <div>
      <textarea aria-label="Reply" value={d.text} readOnly={!d.ready} onChange={(e) => d.edit(e.target.value)} />
      <span data-testid="state">{d.state}{d.conflict ? ' conflict' : ''}</span>
      <span data-testid="why">{d.saveError ? `${d.saveError.retrying ? 'retrying' : 'stopped'}: ${d.saveError.why}` : ''}</span>
      <button onClick={() => void d.flush().catch(() => undefined)}>Flush</button>
    </div>
  );
}

function mount(ui: (api: DeskApi) => DeskApi = (api) => api, props: Parameters<typeof Harness>[0] = {}) {
  const fake = createFakeDesk({ now: TEST_NOW });
  const view = render(<DeskProvider api={ui(fake.api)} ids={fake.ids} lang="en" retry={false}><Harness {...props} /></DeskProvider>);
  return { fake, view };
}
const box = () => screen.getByRole('textbox', { name: 'Reply' }) as HTMLTextAreaElement;
const opened = () => waitFor(() => expect(box().value).toContain('Good news'));
const stored = (fake: ReturnType<typeof createFakeDesk>) => fake.server.records('reply').find((r) => r.id === DRAFT)?.body;

describe('useDraft', () => {
  it('writes one save at a time, so a save waiting behind another is not a teammate\'s edit', async () => {
    // Nothing here depends on how fast the machine is: the first save is held until the test lets it go,
    // and the autosave's 800 ms is the fake clock's, moved by hand.
    vi.useFakeTimers({ shouldAdvanceTime: true });
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    let calls = 0;
    const { fake } = mount((api) => ({
      ...api,
      saveDraft: async (...args) => { calls++; if (calls === 1) await gate; return api.saveDraft(...args); },
    }));
    await opened();
    const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
    fireEvent.change(box(), { target: { value: 'one' } });
    await advance(800); // its autosave goes, and is held at the gate
    await waitFor(() => expect(calls).toBe(1));
    fireEvent.change(box(), { target: { value: 'one two' } });
    await advance(800); // that autosave is due, and has to wait behind the first
    fireEvent.change(box(), { target: { value: 'one two three' } });
    fireEvent.click(screen.getByRole('button', { name: 'Flush' })); // and so does a flush, as a send or a redraft asks for
    expect(calls).toBe(1);
    release();
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('saved'));
    expect(stored(fake)?.body).toBe('one two three');
    expect(calls).toBe(2); // 'one', then the rest in one: the waiting saves did not each write
  });

  it('tries a failed save again after ten seconds, but not one the server refused', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
    let calls = 0;
    let failure = new DeskError('failed', 500, 'BOOM');
    mount((api) => ({ ...api, saveDraft: () => { calls++; return Promise.reject(failure); } }));
    await opened();
    fireEvent.change(box(), { target: { value: 'one' } });
    await advance(800);
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('failed'));
    expect(screen.getByTestId('why').textContent).toMatch(/^retrying: /);
    await advance(11_000);
    expect(calls).toBe(2); // a server error may pass: it tried again

    failure = new DeskError('forbidden', 403, 'FORBIDDEN');
    await advance(11_000);
    await waitFor(() => expect(screen.getByTestId('why').textContent).toBe('stopped: Your account can\'t do that here.'));
    const seen = calls;
    await advance(60_000);
    expect(calls).toBe(seen); // a refusal does not come round again by itself
    fireEvent.change(box(), { target: { value: 'one two' } }); // but typing is another try
    await advance(800);
    expect(calls).toBe(seen + 1);
  });

  it('makes a new draft of the text when a save finds the draft gone, with nothing pushed to say so', async () => {
    const { fake } = mount((api) => ({
      ...api,
      saveDraft: async (...args) => { fake.server.remove('reply', DRAFT); return api.saveDraft(...args); },
    }));
    await opened();
    fireEvent.change(box(), { target: { value: 'Still mine' } });
    await waitFor(() => expect(fake.server.records('reply').some((r) => r.body.key === `draft:${ANA}` && r.body.body === 'Still mine')).toBe(true), SLOW);
    expect(box().value).toBe('Still mine');
    expect(screen.getByTestId('state').textContent).toBe('saved');
  });

  it('keeps the box shut until the ticket\'s draft has arrived, so a keystroke cannot bury it', async () => {
    mount();
    expect(box().readOnly).toBe(true);
    await opened();
    expect(box().readOnly).toBe(false);
  });

  it('does not save with nobody to name as the writer', async () => {
    const fake = createFakeDesk({ now: TEST_NOW });
    const saveDraft = vi.fn(fake.api.saveDraft);
    function Anonymous() {
      const replies = useThread(ANA).data?.replies;
      const d = useDraft(ANA, '', replies);
      return <textarea aria-label="Reply" value={d.text} onChange={(e) => d.edit(e.target.value)} />;
    }
    render(<DeskProvider api={{ ...fake.api, saveDraft }} ids={fake.ids} lang="en" retry={false}><Anonymous /></DeskProvider>);
    await opened();
    fireEvent.change(box(), { target: { value: 'x' } });
    await act(async () => { await new Promise((r) => setTimeout(r, 1200)); });
    expect(saveDraft).not.toHaveBeenCalled();
  });
});
