// @vitest-environment jsdom
import type { RecordPresence } from '@reflexify/agentflow-sdk';
import { QueryClient } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import { StrictMode, useEffect, useState, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import type { DeskIds } from '../../shared/contract.js';
import type { DeskApi } from '../../src/api/desk-api.js';
import { createFakeDesk } from '../../src/api/fake.js';
import { DeskProvider } from '../../src/data/desk-context.js';
import { keys } from '../../src/data/keys.js';
import { LiveProvider } from '../../src/live/LiveProvider.js';
import { useLive, usePresence, type LiveApi } from '../../src/live/live-context.js';
import type { LiveSource } from '../../src/live/source.js';
import { fakeChannel } from '../support/channel.js';
import { BO, HA, TEST_NOW } from '../support/render.js';

const K = '30000000-0000-4000-8000-000000000002';
const K2 = '30000000-0000-4000-8000-000000000003';

function Probe() {
  const live = useLive();
  const first = usePresence(K).viewers.map((v) => v.name).join(',') || '-';
  const second = usePresence(K2).viewers.map((v) => v.name).join(',') || '-';
  return <p data-testid="probe">{`${live.status} pushes=${live.pushes} ${first} ${second}`}</p>;
}
const probe = () => screen.getByTestId('probe').textContent;

function setup(opts: { read?: (entityId: string) => Promise<RecordPresence[]>; api?: (api: DeskApi) => DeskApi; children?: ReactNode } = {}) {
  const fake = createFakeDesk({ now: TEST_NOW });
  const ch = fakeChannel();
  const reads: string[] = [];
  const source: LiveSource = {
    channel: () => ch.channel,
    readPresence: (entityId) => {
      reads.push(entityId);
      return opts.read ? opts.read(entityId) : Promise.resolve([]);
    },
  };
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  const view = render(
    <DeskProvider api={opts.api ? opts.api(fake.api) : fake.api} ids={fake.ids} lang="en" retry={false} queryClient={qc}>
      <LiveProvider source={source}>{opts.children ?? <Probe />}</LiveProvider>
    </DeskProvider>,
  );
  return { ch, fake, qc, reads, view, ticket: fake.ids.entities.ticket };
}

describe('LiveProvider', () => {
  it('reads the stream\'s status, and is live only while the stream is', () => {
    const { ch } = setup();
    expect(probe()).toMatch(/^connecting /);
    act(() => ch.setStatus('live'));
    expect(probe()).toMatch(/^live /);
    act(() => ch.setStatus('polling'));
    expect(probe()).toMatch(/^polling /);
  });

  it('says nothing about polling until the stream has been live on this page', () => {
    const { ch } = setup();
    // AgentFlow without the stream: the channel ends in polling without ever going live.
    act(() => ch.setStatus('polling'));
    expect(probe()).toMatch(/^polling pushes=false /);
    act(() => ch.setStatus('live'));
    act(() => ch.setStatus('polling'));
    expect(probe()).toMatch(/^polling pushes=true /);
  });

  it('refreshes what an event names, and nothing else', () => {
    const { ch, qc, ticket } = setup();
    for (const key of [keys.ticket(K), keys.tasks, keys.thread(K), keys.canned]) qc.setQueryData(key, []);
    const stale = (key: readonly unknown[]) => qc.getQueryState(key)?.isInvalidated ?? false;
    act(() => ch.event({
      id: 'e1', type: 'record.updated', occurred_at: '2026-10-06T11:12:00Z', org_id: 'o', position: 7,
      subject: { kind: 'record', id: K, entity_id: ticket },
    }));
    expect([stale(keys.ticket(K)), stale(keys.tasks), stale(keys.thread(K)), stale(keys.canned)]).toEqual([true, true, false, false]);
  });

  it('refetches everything and reads presence again when told what it shows may be stale', () => {
    const { ch, qc, reads, ticket } = setup();
    qc.setQueryData(keys.canned, []);
    act(() => ch.refetch());
    expect(qc.getQueryState(keys.canned)?.isInvalidated).toBe(true);
    expect(reads).toEqual([ticket]);
  });

  it('reads who has which ticket open each time the stream goes live', async () => {
    const { ch, reads, ticket } = setup({ read: async (entityId) => [{ entity_id: entityId, record_id: K, viewers: [HA.id] }] });
    expect(reads).toEqual([]);
    act(() => ch.setStatus('live'));
    expect(await screen.findByText(`live pushes=true ${HA.name} -`)).toBeTruthy();
    act(() => ch.setStatus('connecting'));
    act(() => ch.setStatus('live'));
    expect(reads).toEqual([ticket, ticket]);
  });

  it('forgets who is where when the stream drops, since the frames sent meanwhile are lost', async () => {
    const { ch, ticket } = setup();
    act(() => ch.setStatus('live'));
    act(() => ch.presence({ entity_id: ticket, record_id: K, viewers: [HA.id] }));
    expect(await screen.findByText(`live pushes=true ${HA.name} -`)).toBeTruthy();
    act(() => ch.setStatus('connecting'));
    expect(probe()).toBe('connecting pushes=true - -');
  });

  it('keeps a presence frame that arrived while presence was being read', async () => {
    let answer!: (records: RecordPresence[]) => void;
    const { ch, ticket } = setup({ read: () => new Promise((resolve) => { answer = resolve; }) });
    act(() => ch.setStatus('live'));
    // Bo opened K after the read was taken: for K, the frame is newer than the read.
    act(() => ch.presence({ entity_id: ticket, record_id: K, viewers: [BO.id] }));
    await act(async () => answer([
      { entity_id: ticket, record_id: K, viewers: [] },
      { entity_id: ticket, record_id: K2, viewers: [HA.id] },
    ]));
    expect(await screen.findByText(`live pushes=true ${BO.name} ${HA.name}`)).toBeTruthy();
  });

  it('ignores presence on records of other entities', async () => {
    const { ch, fake } = setup();
    act(() => ch.setStatus('live'));
    act(() => ch.presence({ entity_id: fake.ids.entities.contact, record_id: K, viewers: [HA.id] }));
    act(() => ch.presence({ entity_id: fake.ids.entities.ticket, record_id: K2, viewers: [HA.id] }));
    expect(await screen.findByText(`live pushes=true - ${HA.name}`)).toBeTruthy();
  });

  it('names someone outside the support group as Someone, and nobody until the names have loaded', async () => {
    let names!: () => void;
    const { ch, ticket } = setup({
      api: (api) => ({ ...api, people: () => new Promise((resolve) => { names = () => resolve(api.people()); }) }),
    });
    act(() => ch.setStatus('live'));
    act(() => ch.presence({ entity_id: ticket, record_id: K, viewers: [HA.id, 'u-stranger'] }));
    expect(probe()).toBe('live pushes=true - -');
    await act(async () => names());
    expect(await screen.findByText(`live pushes=true ${HA.name},Someone -`)).toBeTruthy();
  });

  it('watches the ticket asked for before the stream opened, and the next one, and lets go at the end without closing the channel', () => {
    function Pane() {
      const { watch } = useLive();
      const [ticket, setTicket] = useState<string | null>(K);
      useEffect(() => {
        watch(ticket);
        return () => watch(null);
      }, [ticket, watch]);
      return <button onClick={() => setTicket(K2)}>next</button>;
    }
    const { ch, ticket, view } = setup({ children: <Pane /> });
    expect(ch.watched).toEqual([{ entityId: ticket, recordId: K }]);
    act(() => screen.getByText('next').click());
    expect(ch.watched.slice(1)).toEqual([null, { entityId: ticket, recordId: K2 }]);
    view.unmount();
    expect(ch.watched.at(-1)).toBeNull();
    // The channel is the host's: it closes it when the desk unmounts.
    expect(ch.closed()).toBe(false);
    expect(ch.listening()).toBe(0);
  });

  it('refetches every list at once when the stream is refused for good', () => {
    const { ch, qc } = setup();
    qc.setQueryData(keys.me, { id: 'me' });
    act(() => ch.revoke());
    expect(qc.getQueryState(keys.me)?.isInvalidated).toBe(true);
  });

  it('hands out the same actions for as long as it lives, and retries the stream on request', () => {
    const seen: Pick<LiveApi, 'watch' | 'retry'>[] = [];
    function Actions() {
      const { watch, retry } = useLive();
      seen.push({ watch, retry });
      return null;
    }
    const { ch, ticket } = setup({ children: <Actions /> });
    act(() => ch.setStatus('live'));
    act(() => ch.presence({ entity_id: ticket, record_id: K, viewers: [HA.id] }));
    act(() => ch.setStatus('polling'));
    expect(seen.length).toBeGreaterThan(2);
    expect(new Set(seen.map((a) => a.watch)).size).toBe(1);
    expect(new Set(seen.map((a) => a.retry)).size).toBe(1);
    act(() => seen[0]!.retry());
    expect(ch.retry).toHaveBeenCalledOnce();
  });

  it('keeps the host\'s channel open, and still hears it, when its effect runs again', () => {
    const ch = fakeChannel();
    const source: LiveSource = { channel: () => ch.channel, readPresence: async () => [] };
    const fake = createFakeDesk({ now: TEST_NOW });
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
    const tree = (ids: DeskIds) => (
      <StrictMode>
        <DeskProvider api={fake.api} ids={ids} lang="en" retry={false} queryClient={qc}>
          <LiveProvider source={source}><Probe /></LiveProvider>
        </DeskProvider>
      </StrictMode>
    );
    const view = render(tree(fake.ids));
    // StrictMode ran the effect, cleaned it up and ran it again.
    expect(ch.closed()).toBe(false);
    expect(ch.listening()).toBe(5);
    // The ids change, as a host's answer to /app/objects could: the effect runs again.
    view.rerender(tree({ ...fake.ids, entities: { ...fake.ids.entities } }));
    expect(ch.closed()).toBe(false);
    expect(ch.listening()).toBe(5);
    qc.setQueryData(keys.tasks, []);
    act(() => ch.event({
      id: 'e9', type: 'work.claimed', occurred_at: '2026-10-06T11:12:00Z', org_id: 'o', position: 9,
      subject: { kind: 'work', id: 't1', entity_id: 'e-wt', workflow_id: fake.ids.workflows.handling },
    }));
    expect(qc.getQueryState(keys.tasks)?.isInvalidated).toBe(true);
    view.unmount();
    expect(ch.closed()).toBe(false);
    expect(ch.listening()).toBe(0);
  });

  it('hears only the record and work events the desk reads: the host\'s channel carries every type', () => {
    const { ch, qc, fake } = setup();
    qc.setQueryData(keys.tasks, []);
    const handling = fake.ids.workflows.handling;
    act(() => ch.event({
      id: 'e8', type: 'instance.completed', occurred_at: '2026-10-06T11:12:00Z', org_id: 'o', position: 8,
      subject: { kind: 'instance', id: 'i1', entity_id: 'e-wt', workflow_id: handling },
    }));
    expect(qc.getQueryState(keys.tasks)?.isInvalidated).toBe(false);
    act(() => ch.event({
      id: 'e9', type: 'work.claimed', occurred_at: '2026-10-06T11:12:00Z', org_id: 'o', position: 9,
      subject: { kind: 'work', id: 't1', entity_id: 'e-wt', workflow_id: handling },
    }));
    expect(qc.getQueryState(keys.tasks)?.isInvalidated).toBe(true);
  });
});
