// @vitest-environment jsdom
import { act, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DeskApi } from '../../src/api/desk-api.js';
import { DEMO_PEOPLE } from '../../src/api/seed.js';
import { useCanned, useDrafts, useHeld, useMentions, useRules, useTasks, useThread, useTicket, useTicketCount, useTickets } from '../../src/data/hooks.js';
import { LiveStatusContext, type LiveStatus } from '../../src/data/live-status.js';
import { POLL_MS } from '../../src/model/timing.js';
import { renderDesk } from '../support/render.js';

const K = '30000000-0000-4000-8000-000000000002';

afterEach(() => {
  vi.useRealTimers();
});

/** Every read the desk makes through the hooks below, in the order `Lists` makes them. */
const READS = ['handlingTasks', 'ticket', 'tickets', 'countTickets', 'thread', 'drafts', 'heldMessages', 'mentions', 'autopilotRules', 'cannedReplies'] as const;

function Lists() {
  const loaded = [
    useTasks().data, useTicket(K).data, useTickets(['new']).data, useTicketCount(['new']).data, useThread(K).data,
    useDrafts().data, useHeld().data, useMentions(DEMO_PEOPLE.bo).data, useRules().data, useCanned().data,
  ];
  return <p>{loaded.every((d) => d !== undefined) ? 'loaded' : 'loading'}</p>;
}

/** The fake API with a call counter on each read `Lists` makes. */
function counted() {
  const calls: Record<string, number> = Object.fromEntries(READS.map((r) => [r, 0]));
  const api = (inner: DeskApi): DeskApi => {
    const wrapped = { ...inner };
    for (const name of READS) {
      const original = inner[name] as (...a: unknown[]) => Promise<unknown>;
      (wrapped as unknown as Record<string, unknown>)[name] = (...a: unknown[]) => { calls[name] = (calls[name] ?? 0) + 1; return original(...a); };
    }
    return wrapped;
  };
  return { calls, api };
}

/** Mounts every list under `status`, once, with the poll timer faked from before the first mount. */
async function mount(status: LiveStatus) {
  // Only the interval is faked, and before the lists mount: that is when their timers start.
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
  const { calls, api } = counted();
  renderDesk(<LiveStatusContext.Provider value={status}><Lists /></LiveStatusContext.Provider>, { api });
  await screen.findByText('loaded');
  for (const name of READS) expect(calls[name], name).toBe(1);
  return calls;
}

describe('what polls, and when', () => {
  it('refetches every list every 30 seconds while the stream is down', async () => {
    const calls = await mount('polling');
    await act(async () => { await vi.advanceTimersByTimeAsync(POLL_MS + 100); });
    for (const name of READS) expect(calls[name], name).toBe(2);
  });

  it('leaves every list to the stream while it is live, saved replies and autopilot rules too', async () => {
    const calls = await mount('live');
    await act(async () => { await vi.advanceTimersByTimeAsync(POLL_MS + 100); });
    for (const name of READS) expect(calls[name], name).toBe(1);
  });
});
