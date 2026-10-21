import { createAgentFlowClient, proxyAdapter, type AppHost } from '@reflexify/agentflow-sdk';
import { describe, expect, it } from 'vitest';
import { hostLiveSource } from '../../src/live/source.js';
import { fakeChannel } from '../support/channel.js';

const BASE = 'https://desk.test/agentflow/api';

/** The two members of a host the live layer reads, counting how often `realtime` is read. */
function hostWith(fetch: (request: Request) => Promise<Response>) {
  const ch = fakeChannel();
  let reads = 0;
  const host = {
    api: createAgentFlowClient({ baseUrl: BASE, auth: proxyAdapter(), fetch, maxRetries: 0 }),
    get realtime() {
      reads += 1;
      return ch.channel;
    },
  } as unknown as AppHost;
  return { host, channel: ch.channel, reads: () => reads };
}

describe('hostLiveSource', () => {
  it('hands out the host\'s own channel, and reads it only when asked', () => {
    const { host, channel, reads } = hostWith(() => new Promise<Response>(() => {}));
    const live = hostLiveSource(host);
    expect(reads()).toBe(0);
    expect(live.channel()).toBe(channel);
    expect(live.channel()).toBe(channel);
    expect(reads()).toBe(2);
  });

  it('reads who has which record of an entity open through the host\'s client', async () => {
    const records = [{ entity_id: 'e-ticket', record_id: 'k1', viewers: ['u1'] }];
    const requests: Request[] = [];
    const { host } = hostWith(async (request) => {
      requests.push(request);
      return Response.json({ records });
    });
    expect(await hostLiveSource(host).readPresence('e-ticket')).toEqual(records);
    expect(new URL(requests[0]!.url).pathname).toBe('/agentflow/api/entities/e-ticket/presence');
  });
});
