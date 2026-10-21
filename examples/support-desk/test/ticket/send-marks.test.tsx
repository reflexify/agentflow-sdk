// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeDesk } from '../../src/api/fake.js';
import { Desk } from '../../src/shell/Desk.js';
import { renderDesk, TEST_NOW } from '../support/render.js';

const ANA = '30000000-0000-4000-8000-000000000002';

beforeEach(() => {
  // As composer-send's: timers that also move with real time, dated from the seed's "now".
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(TEST_NOW);
  window.sessionStorage.clear();
  window.localStorage.clear();
  window.history.pushState({}, '', `/f/mine/t/${ANA}`);
});
afterEach(() => vi.useRealTimers());

const box = () => screen.getByRole('textbox', { name: 'Reply' }) as HTMLTextAreaElement;
const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });

describe('send and mark, when the customer writes during the countdown', () => {
  it('sends the reply, leaves the ticket open, and says why', async () => {
    const fake = createFakeDesk({ now: TEST_NOW, atomicDelayMs: 1000 });
    renderDesk(<Desk />, { fake });
    await waitFor(() => expect(box().value).toContain('Good news'));
    fireEvent.keyDown(box(), { key: 'Enter', metaKey: true, shiftKey: true });
    await screen.findByRole('button', { name: 'Undo' });
    act(() => { fake.server.write('ticket', ANA, { last_customer_at: new Date(TEST_NOW.getTime() + 60_000).toISOString() }); });
    await advance(10_000);
    await advance(2000);
    expect(await screen.findByText(
      'Sent, but the ticket wasn\'t marked: the customer wrote while you were working. Their message is in the thread.',
    )).toBeTruthy();
    expect(fake.server.runs().filter((r) => r.workflow === 'send_reply')).toHaveLength(1);
    expect(fake.server.records('ticket').find((t) => t.id === ANA)?.body.status).toBe('open');
    expect(fake.server.tasks().filter((t) => t.ticketId === ANA).map((t) => t.status)).toEqual(['completed', 'open']);
  });
});
