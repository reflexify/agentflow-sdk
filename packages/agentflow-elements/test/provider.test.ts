import { AgentFlowError } from '@reflexify/agentflow-sdk';
import { describe, expect, it, vi } from 'vitest';
import { CALLER, json, mount, problem, reportOf, settle, stubApi } from './support.js';

const events = (el: HTMLElement, ...types: string[]) => {
  const seen: { type: string; detail: unknown }[] = [];
  for (const type of types) el.addEventListener(type, (e) => seen.push({ type, detail: (e as CustomEvent).detail }));
  return seen;
};

describe('<agentflow-provider>', () => {
  it('loads the caller and reports session-ready', async () => {
    const api = stubApi({ 'GET /caller': () => json(200, CALLER) });
    const seen = events(document.body, 'session-ready');
    const provider = await mount('', api);
    expect(provider.dataset.state).toBe('ready');
    expect(seen).toEqual([{ type: 'session-ready', detail: { caller: CALLER } }]);
  });

  it('reports signed-out on a 401 and access-lost on an app refusal', async () => {
    const out = events(document.body, 'signed-out');
    const p1 = await mount('', stubApi({ 'GET /caller': () => problem(401, 'NOT_SIGNED_IN') }));
    expect(p1.dataset.state).toBe('signed-out');
    expect(out).toHaveLength(1);

    const lost = events(document.body, 'access-lost');
    const p2 = await mount('', stubApi({ 'GET /caller': () => problem(403, 'APP_NOT_ASSIGNED') }));
    expect(p2.dataset.state).toBe('access-lost');
    expect(lost).toEqual([{ type: 'access-lost', detail: { code: 'APP_NOT_ASSIGNED' } }]);
  });

  it('reports request-failed and state error for anything else', async () => {
    const failed = events(document.body, 'request-failed');
    const p = await mount('', stubApi({ 'GET /caller': () => problem(503, 'IDP_UNAVAILABLE') }));
    expect(p.dataset.state).toBe('error');
    expect(failed[0]?.detail).toMatchObject({ code: 'IDP_UNAVAILABLE', status: 503, requestId: 'req-test' });
  });

  it('concurrent 401s report signed-out once', async () => {
    const out = events(document.body, 'signed-out');
    const p = await mount('', stubApi({ 'GET /caller': () => json(200, CALLER) }));
    const report = reportOf(p);
    report(new AgentFlowError(401, 'NOT_SIGNED_IN'));
    report(new AgentFlowError(401, 'NOT_SIGNED_IN'));
    await settle();
    expect(out).toHaveLength(1);
  });

  it('hands out report only through the context protocol, with no hook on the element', async () => {
    const p = await mount('', stubApi({ 'GET /caller': () => json(200, CALLER) }));
    expect(Object.keys(p).filter((k) => /report/i.test(k))).toEqual([]);
    expect('__agentflowReport' in p).toBe(false);
  });

  it('data-state already holds the new state when each event fires', async () => {
    const at: [string, string | undefined][] = [];
    for (const type of ['session-ready', 'signed-out', 'access-lost', 'request-failed']) {
      document.body.addEventListener(type, (e) => at.push([type, (e.target as HTMLElement).dataset.state]));
    }

    const p = await mount('', stubApi({ 'GET /caller': () => json(200, CALLER) }));
    reportOf(p)(new AgentFlowError(401, 'NOT_SIGNED_IN'));
    await mount('', stubApi({ 'GET /caller': () => problem(401, 'NOT_SIGNED_IN') }));
    await mount('', stubApi({ 'GET /caller': () => problem(403, 'APP_NOT_ASSIGNED') }));
    await mount('', stubApi({ 'GET /caller': () => problem(503, 'IDP_UNAVAILABLE') }));

    expect(at).toEqual([
      ['session-ready', 'ready'],
      ['signed-out', 'signed-out'],
      ['signed-out', 'signed-out'],
      ['access-lost', 'access-lost'],
      ['request-failed', 'error'],
    ]);
  });

  it('a provider removed before /caller answers fires nothing', async () => {
    let answer!: (res: Response) => void;
    const p = await mount('', stubApi({ 'GET /caller': () => new Promise<Response>((r) => (answer = r)) }));
    const seen = events(p, 'session-ready', 'signed-out', 'access-lost', 'request-failed');
    p.remove();
    await settle();
    answer(json(200, CALLER));
    await settle();
    expect(seen).toEqual([]);
    expect(p.dataset.state).toBe('loading');
  });

  it('falls back to /agentflow, with one warning, for a base-path that is not a path on this origin', async () => {
    for (const basePath of ['@evil.example', '.evil.example', '//evil.example', 'evil.example', '/\\evil.example', '']) {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const urls: string[] = [];
      const wrapped = (async (input: Request) => {
        urls.push(input.url);
        return json(200, CALLER);
      }) as typeof fetch;
      const p = await mount('', { ...stubApi({}), fetch: wrapped }, { 'base-path': basePath });
      expect(p.dataset.state, JSON.stringify(basePath)).toBe('ready');
      expect(urls, JSON.stringify(basePath)).toEqual([`${location.origin}/agentflow/api/caller`]);
      expect(warn, JSON.stringify(basePath)).toHaveBeenCalledOnce();
      warn.mockRestore();
    }
  });

  it('takes a base-path with trailing slashes, and / for the origin itself', async () => {
    for (const [basePath, url] of [['/af//', '/af/api/caller'], ['/', '/api/caller']]) {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const paths: string[] = [];
      const wrapped = (async (input: Request) => {
        paths.push(new URL(input.url).pathname);
        return json(200, CALLER);
      }) as typeof fetch;
      await mount('', { ...stubApi({}), fetch: wrapped }, { 'base-path': basePath! });
      expect(paths).toEqual([url]);
      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    }
  });

  it('uses the base-path attribute for the API', async () => {
    const api = stubApi({});
    const calls: string[] = [];
    const wrapped = (async (input: Request) => {
      calls.push(new URL(input.url).pathname);
      return json(200, CALLER);
    }) as typeof fetch;
    await mount('', { ...api, fetch: wrapped }, { 'base-path': '/custom' });
    expect(calls).toEqual(['/custom/api/caller']);
  });
});
