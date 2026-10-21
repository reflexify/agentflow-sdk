// @vitest-environment jsdom
import { act, screen, waitFor } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { describe, expect, it } from 'vitest';
import type { DeskApi } from '../../src/api/desk-api.js';
import { MEMORY_WORKFLOW_TASK_ENTITY_ID } from '../../src/api/memory-server.js';
import { useTasks, useThread } from '../../src/data/hooks.js';
import { useLive, usePresence, type LiveApi } from '../../src/live/live-context.js';
import { HA, renderDesk } from '../support/render.js';

const K = '30000000-0000-4000-8000-000000000002'; // TK-2026-0418 in the seed
const K2 = '30000000-0000-4000-8000-000000000003';

function Thread() {
  const thread = useThread(K);
  return <p>{`replies ${thread.data?.replies.length ?? '…'}`}</p>;
}

/** The ticket pane's way: watch in an effect that runs once per ticket, and let go on the way out. */
function Pane() {
  const live = useLive();
  const [ticket, setTicket] = useState<string | null>(K);
  useEffect(() => {
    live.watch(ticket);
    return () => live.watch(null);
  }, [ticket]); // eslint-disable-line react-hooks/exhaustive-deps
  const first = usePresence(K).viewers.map((v) => v.name).join(',') || '-';
  const second = usePresence(K2).viewers.map((v) => v.name).join(',') || '-';
  return (
    <>
      <button onClick={() => setTicket(K2)}>next</button>
      <button onClick={() => setTicket(null)}>leave</button>
      <p>{`first ${first} second ${second}`}</p>
    </>
  );
}

function Queue() {
  const tasks = useTasks();
  return <p>{`claimed ${tasks.data?.filter((t) => t.status === 'claimed').length ?? '…'}`}</p>;
}

describe('FakeLiveProvider', () => {
  it('refetches when the memory server changes a ticket\'s thread', async () => {
    const { fake } = renderDesk(<Thread />);
    await screen.findByText('replies 5');
    act(() => {
      fake.server.write('reply', null, { ticket: K, author_kind: 'customer', status: 'received', body: 'Also, my office?', posted_at: '2026-10-06T11:14:00Z', key: '<new@x>' });
    });
    await waitFor(() => expect(screen.getByText('replies 6')).toBeTruthy());
  });

  it('refetches the queue when the memory server claims a task', async () => {
    const { fake } = renderDesk(<Queue />);
    const before = Number((await screen.findByText(/^claimed \d+$/)).textContent!.replace('claimed ', ''));
    const open = fake.server.tasks().find((t) => t.status === 'open')!;
    await act(async () => { await fake.api.claim({ id: open.id, entityId: MEMORY_WORKFLOW_TASK_ENTITY_ID }); });
    await waitFor(() => expect(screen.getByText(`claimed ${before + 1}`)).toBeTruthy());
  });

  it('shows you watching the ticket you are on, and stops when you move on or leave', async () => {
    renderDesk(<Pane />);
    expect(await screen.findByText('first Bo Tran second -')).toBeTruthy();
    act(() => screen.getByText('next').click());
    expect(screen.getByText('first - second Bo Tran')).toBeTruthy();
    act(() => screen.getByText('leave').click());
    expect(screen.getByText('first - second -')).toBeTruthy();
  });

  it('shows whoever the test says has a ticket open, by name', async () => {
    const { live } = renderDesk(<Pane />);
    await screen.findByText('first Bo Tran second -');
    act(() => live.setPresence(K2, [HA.id]));
    expect(screen.getByText(`first Bo Tran second ${HA.name}`)).toBeTruthy();
  });

  it('forgets who is where when it goes offline, and puts you back on your ticket when it returns', async () => {
    const { live } = renderDesk(<Pane />);
    await screen.findByText('first Bo Tran second -');
    act(() => live.setPresence(K2, [HA.id]));
    act(() => live.setStatus('polling'));
    expect(screen.getByText('first - second -')).toBeTruthy();
    act(() => live.setStatus('live'));
    expect(screen.getByText('first Bo Tran second -')).toBeTruthy();
  });

  it('refreshes the queue when a ticket changes, as the stream does', async () => {
    let asked = 0;
    const api = (inner: DeskApi): DeskApi => ({ ...inner, handlingTasks: () => { asked += 1; return inner.handlingTasks(); } });
    const { fake } = renderDesk(<Queue />, { api });
    await screen.findByText(/^claimed \d+$/);
    expect(asked).toBe(1);
    act(() => { fake.server.write('ticket', K, { subject: 'A new subject' }); });
    await waitFor(() => expect(asked).toBe(2));
  });

  it('hands out the same actions however the presence or the status changes', () => {
    const seen: Pick<LiveApi, 'watch' | 'retry'>[] = [];
    function Actions() {
      const { watch, retry } = useLive();
      seen.push({ watch, retry });
      return null;
    }
    const { live } = renderDesk(<Actions />);
    act(() => live.setPresence(K, [HA.id]));
    act(() => live.setStatus('polling'));
    act(() => live.setStatus('live'));
    expect(seen.length).toBeGreaterThan(3);
    for (const name of ['watch', 'retry'] as const) {
      expect(new Set(seen.map((a) => a[name])).size, name).toBe(1);
    }
  });
});
