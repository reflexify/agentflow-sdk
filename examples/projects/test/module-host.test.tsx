// @vitest-environment jsdom
import type { PublicEvent } from '@reflexify/agentflow-sdk';
import { act, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createMemoryServer } from '../src/api/memory-server.js';
import { createSeed, HOA, MINH } from '../src/api/seed.js';
import { cleanupHosts, projectsOnHost } from './support/on-host.js';
import { TEST_IDS } from './support/ids.js';

const LAUNCH = 'Ra mắt ứng dụng';
const LOGIN = 'Thiết kế màn hình đăng nhập';

function server() {
  const s = createMemoryServer(createSeed(new Date()));
  s.actAs(MINH);
  return s;
}
const idOf = (s: ReturnType<typeof server>, entity: 'project' | 'task', name: string) =>
  s.records(entity).find((r) => r.body[entity === 'project' ? 'name' : 'title'] === name)!.id;

beforeEach(() => window.history.replaceState(null, '', '/elsewhere'));
afterEach(() => cleanupHosts());

describe('Projects inside AgentFlow', () => {
  it('moves only through host.navigate, never the address bar itself', async () => {
    const s = server();
    const m = await projectsOnHost({ server: s, path: '/projects' });
    fireEvent.click(await m.ui.findByText(LAUNCH));
    expect(m.host.navigated).toEqual([`/p/${idOf(s, 'project', LAUNCH)}`]);
    await waitFor(() => expect(m.ui.getByRole('navigation').textContent).toBe(`Projects › ${LAUNCH}`));
    expect(window.location.pathname).toBe('/elsewhere');
  });

  it('follows back and forward, which the host reports without the module asking', async () => {
    const s = server();
    const launch = idOf(s, 'project', LAUNCH);
    const task = idOf(s, 'task', LOGIN);
    const m = await projectsOnHost({ server: s, path: '/projects' });
    fireEvent.click(await m.ui.findByText(LAUNCH));
    fireEvent.click(await m.ui.findByRole('button', { name: 'Projects' }));
    expect(m.host.navigated).toEqual([`/p/${launch}`, '/projects']);
    // Back: to the project, then to its task's drawer by forward.
    act(() => m.host.go(`/p/${launch}`));
    await waitFor(() => expect(m.ui.getByRole('navigation').textContent).toBe(`Projects › ${LAUNCH}`));
    act(() => m.host.go(`/p/${launch}/t/${task}`));
    expect(await m.ui.findByRole('dialog', { name: LOGIN })).toBeTruthy();
    act(() => m.host.go(`/p/${launch}`));
    await waitFor(() => expect(m.ui.queryByRole('dialog')).toBeNull());
    act(() => m.host.go('/projects'));
    expect(await m.ui.findByText(LAUNCH)).toBeTruthy();
    expect(m.ui.getByRole('navigation').textContent).toBe('Projects');
    expect(m.host.navigated).toEqual([`/p/${launch}`, '/projects']);
    expect(window.location.pathname).toBe('/elsewhere');
  });

  it('changes language in place: the same header, re-rendered', async () => {
    const m = await projectsOnHost({ server: server(), path: '/projects', locale: 'en-GB' });
    const crumb = await m.ui.findByText('Projects');
    act(() => m.host.setLocale('vi'));
    await waitFor(() => expect(crumb.textContent).toBe('Dự án'));
    expect(m.ui.getByRole('navigation').contains(crumb)).toBe(true);
  });

  it('refreshes a task on screen when the channel says it changed', async () => {
    const s = server();
    const task = idOf(s, 'task', LOGIN);
    const m = await projectsOnHost({ server: s, path: `/p/${idOf(s, 'project', LAUNCH)}/t/${task}` });
    await m.ui.findByRole('dialog', { name: LOGIN });
    s.write('task', task, { title: 'Màn hình đăng nhập mới' }, HOA);
    const event: PublicEvent = {
      id: 'e1', type: 'record.updated', occurred_at: new Date().toISOString(), org_id: 'org', position: 1,
      subject: { kind: 'record', id: task, entity_id: TEST_IDS.entities.task },
    };
    act(() => m.host.channel.event(event));
    expect(await m.ui.findByRole('dialog', { name: 'Màn hình đăng nhập mới' })).toBeTruthy();
  });

  it('lets go of the channel on unmount without closing it', async () => {
    const m = await projectsOnHost({ server: server() });
    await m.ui.findByRole('navigation');
    await waitFor(() => expect(m.host.channel.listening()).toBeGreaterThan(0));
    m.unmount();
    expect(m.host.channel.listening()).toBe(0);
    expect(m.host.channel.closed()).toBe(false);
    expect(m.host.channel.watched.at(-1)).toBeNull();
  });
});
