// @vitest-environment jsdom
import type { AppModule } from '@reflexify/agentflow-sdk';
import { act, fireEvent, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { appObjectsFor } from '../shared/app-objects.js';
import { DEMO_IDS } from '../src/api/demo-ids.js';
import { DEMO_PEOPLE } from '../src/api/seed.js';
import { mount } from '../src/module.js';
import { TEXT } from '../src/text.js';
import { cleanupHosts, deskOnHost } from './support/desk-on-host.js';
import { BASE_PATH } from './support/host.js';

const ANA = '30000000-0000-4000-8000-000000000002';
const ANA_HEADING = 'Where is my order? It was due Friday';
const settle = () => new Promise((resolve) => setTimeout(resolve, 50));

beforeEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
  // The desk never moves the address bar itself: inside AgentFlow it is AgentFlow's.
  window.history.replaceState(null, '', '/elsewhere');
});
afterEach(() => {
  cleanupHosts();
  window.history.replaceState(null, '', '/');
});

describe('the desk as a module: its objects', () => {
  it('asks /app/objects once, before anything else, and opens what a link with a query and a fragment names', async () => {
    const { desk, requests, host } = deskOnHost({ path: `/f/mine/t/${ANA}?from=mail#reply` });
    expect(await desk.findByRole('heading', { name: ANA_HEADING })).toBeTruthy();
    expect(host.basePath).toBe(BASE_PATH);
    expect(requests[0]).toBe('GET /app/objects');
    expect(requests.filter((r) => r === 'GET /app/objects')).toHaveLength(1);
  });

  it('shows Loading… until its objects are read, and asks for nothing else meanwhile', async () => {
    const { root, requests } = deskOnHost({ objects: () => new Promise<Response>(() => {}) });
    expect(root.textContent).toBe(TEXT.en.loading);
    await settle();
    expect(requests).toEqual(['GET /app/objects']);
  });

  it('names what the installation lacks, and sends nothing with an empty id', async () => {
    const body = appObjectsFor(DEMO_IDS);
    const objects = body.objects
      .map((o) => (o.logical_key === 'entity:canned_reply' ? { ...o, state: 'off' as const, id: null, key: null } : o));
    const { desk, requests } = deskOnHost({ objects: () => Response.json({ ...body, objects, parameters: {} }) });
    const notice = await desk.findByRole('alert');
    expect(notice.textContent).toContain(TEXT.en.objectsMissingTitle);
    expect(within(notice).getAllByRole('listitem').map((li) => li.textContent))
      .toEqual(['entity:canned_reply', 'parameters.support_group_id']);
    await settle();
    expect(requests).toEqual(['GET /app/objects']);
  });

  it('says it could not read its objects, and tries again when asked', async () => {
    let calls = 0;
    const { desk, requests } = deskOnHost({
      objects: () => (++calls === 1
        ? Response.json({ type: 'INTERNAL_ERROR', title: 'Internal error', status: 500 }, { status: 500 })
        : Response.json(appObjectsFor(DEMO_IDS))),
    });
    expect((await desk.findByRole('alert')).textContent).toContain(TEXT.en.objectsFailed);
    fireEvent.click(desk.getByRole('button', { name: 'Try again' }));
    expect(await desk.findByRole('button', { name: /^Mine/ })).toBeTruthy();
    expect(requests.filter((r) => r === 'GET /app/objects')).toHaveLength(2);
  });
});

describe('the desk as a module: objects that cannot be read', () => {
  it('says it could not read them, as for a failed read, when an entry of the listing is not an object', async () => {
    const { desk, root } = deskOnHost({ objects: () => Response.json({ ...appObjectsFor(DEMO_IDS), objects: [null] }) });
    const notice = await desk.findByRole('alert');
    expect(notice.textContent).toContain(TEXT.en.objectsFailed);
    expect(within(notice).getByRole('button', { name: TEXT.en.tryAgain })).toBeTruthy();
    expect(root.childElementCount).toBeGreaterThan(0);
  });
});

describe('the desk as a module: routes', () => {
  it('goes where it is sent through the host, and never touches the address bar', async () => {
    const { desk, host } = deskOnHost();
    fireEvent.click(await desk.findByRole('button', { name: /^Waiting on customer/ }));
    expect(host.navigated.at(-1)).toBe('/f/waiting');
    expect(desk.getByRole('button', { name: /^Waiting on customer/ }).getAttribute('aria-current')).toBe('page');
    expect(window.location.pathname).toBe('/elsewhere');
  });

  it('links an attachment under the API its host names, wherever the host has it', async () => {
    const { desk } = deskOnHost({ path: `/f/mine/t/${ANA}`, apiUrl: (path) => `https://af.example/api/v1${path}` });
    const log = await desk.findByRole('log', { name: 'Conversation' });
    const file = await within(log).findByRole('link', { name: /tracking-screenshot\.png/ });
    expect(file.getAttribute('href')).toBe('https://af.example/api/v1/attachments/att-1/download');
  });

  it('follows the host\'s back and forward, a query and a fragment included', async () => {
    const { desk, host } = deskOnHost();
    await desk.findByRole('button', { name: /^Mine/ });
    act(() => host.go('/held'));
    expect(desk.getByRole('button', { name: /^Held messages/ }).getAttribute('aria-current')).toBe('page');
    act(() => host.go(`/f/mine/t/${ANA}?from=mail#reply`));
    expect(await desk.findByRole('heading', { name: ANA_HEADING })).toBeTruthy();
  });
});

describe('the desk as a module: language', () => {
  it('speaks the host\'s language from the start', async () => {
    const { desk } = deskOnHost({ locale: 'vi' });
    expect(await desk.findByRole('button', { name: /^Của tôi/ })).toBeTruthy();
  });

  it('follows a language switch without remounting: a half-typed reply stays', async () => {
    const { desk, host } = deskOnHost({ path: `/f/mine/t/${ANA}`, locale: 'en-GB' });
    const box = (await desk.findByRole('textbox', { name: 'Reply' })) as HTMLTextAreaElement;
    await waitFor(() => expect(box.value).toContain('Good news'));
    fireEvent.change(box, { target: { value: 'Half-typed' } });
    act(() => host.setLocale('vi-VN'));
    expect(await desk.findByRole('button', { name: /^Của tôi/ })).toBeTruthy();
    expect(box.isConnected).toBe(true);
    expect(box.value).toBe('Half-typed');
  });
});

describe('the desk as a module: live updates', () => {
  it('runs on the host\'s channel, hears it after StrictMode ran its effect twice, and never closes it', async () => {
    const { desk, host, requests, root, unmount } = deskOnHost();
    await desk.findByRole('button', { name: /^Mine/ });
    expect(host.realtimeReads()).toBeGreaterThan(0);
    act(() => host.channel.setStatus('live'));
    expect(await desk.findByText('Live')).toBeTruthy();
    expect(host.channel.closed()).toBe(false);
    const before = requests.filter((r) => r === 'GET /work').length;
    act(() => host.channel.event({
      id: 'e1', type: 'work.claimed', occurred_at: '2026-10-06T11:12:00Z', org_id: 'org', position: 1,
      subject: { kind: 'work', id: 't1', entity_id: 'e-wt', workflow_id: DEMO_IDS.workflows.handling },
    }));
    await waitFor(() => expect(requests.filter((r) => r === 'GET /work').length).toBeGreaterThan(before));
    expect(host.listening()).toEqual({ location: 1, theme: 0, locale: 1 });

    unmount();
    expect(host.channel.closed()).toBe(false);
    expect(host.channel.listening()).toBe(0);
    expect(host.listening()).toEqual({ location: 0, theme: 0, locale: 0 });
    expect(root.childElementCount).toBe(0);
  });

  it('runs the demo on the fake live layer over the same memory server, and never reads the host\'s channel', async () => {
    const onReady = vi.fn();
    const { desk, host } = deskOnHost({
      options: (fake) => ({ demo: { server: fake.server, you: DEMO_PEOPLE.bo, onReady } }),
    });
    await desk.findByRole('button', { name: /^Mine/ });
    await waitFor(() => expect(onReady).toHaveBeenCalled());
    expect(await desk.findByText('Live')).toBeTruthy();
    expect(host.realtimeReads()).toBe(0);
  });
});

describe('the module entry', () => {
  it('is an AppModule whose mount renders the desk', async () => {
    const entry: AppModule = { mount };
    const { desk } = deskOnHost({ mount: entry.mount });
    expect(await desk.findByText('Bo Tran')).toBeTruthy();
  });
});

describe('the desk as a module: styles', () => {
  it('puts its stylesheet in its shadow root, not the page, and takes it out when it unmounts', async () => {
    const { desk, shadow, unmount } = deskOnHost();
    await desk.findByRole('button', { name: /^Mine/ });
    const styles = shadow.querySelectorAll('style');
    expect(styles).toHaveLength(1);
    expect(styles[0]!.textContent).toContain(':host(');
    expect(document.head.querySelectorAll('style')).toHaveLength(0);
    unmount();
    expect(shadow.querySelectorAll('style')).toHaveLength(0);
  });
});
