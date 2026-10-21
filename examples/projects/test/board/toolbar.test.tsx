// @vitest-environment jsdom
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeProjects } from '../../src/api/fake.js';
import { MINH } from '../../src/api/seed.js';
import { App } from '../../src/shell/App.js';
import { TEXT } from '../../src/text.js';
import { renderProjects, TEST_NOW } from '../support/render.js';

const vi_ = TEXT.vi;
const here = () => window.location.pathname + window.location.search;
const groupSelect = () => screen.getByRole('combobox', { name: vi_.groupBy }) as HTMLSelectElement;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

function seeded() {
  const fake = createFakeProjects({ you: MINH });
  const launch = fake.server.records('project').find((r) => r.body.name === 'Ra mắt ứng dụng')!.id;
  return { fake, launch };
}

describe('the Tasks tab toolbar', () => {
  it('carries each choice into the address, one step at a time', async () => {
    const { fake, launch } = seeded();
    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${launch}` });

    fireEvent.click(await screen.findByRole('tab', { name: vi_.viewList }));
    expect(here()).toBe(`/p/${launch}?view=list`);
    await waitFor(() => expect(screen.getByRole('tab', { name: vi_.viewList }).getAttribute('aria-selected')).toBe('true'));

    fireEvent.change(groupSelect(), { target: { value: 'priority' } });
    expect(here()).toBe(`/p/${launch}?view=list&group=priority`);

    fireEvent.change(screen.getByRole('combobox', { name: vi_.doneWindow }), { target: { value: '7' } });
    expect(here()).toBe(`/p/${launch}?view=list&group=priority&done=7`);

    fireEvent.click(screen.getByRole('checkbox', { name: vi_.showCancelled }));
    expect(here()).toBe(`/p/${launch}?view=list&group=priority&done=7&cancelled=1`);
    expect((screen.getByRole('checkbox', { name: vi_.showCancelled }) as HTMLInputElement).checked).toBe(true);

    fireEvent.click(screen.getByRole('tab', { name: vi_.viewBoard }));
    expect(here()).toBe(`/p/${launch}?group=priority&done=7&cancelled=1`);
  });

  it('offers every grouping and every window for completed tasks, in the order the spec gives', async () => {
    const { fake, launch } = seeded();
    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${launch}` });
    await screen.findByRole('tab', { name: vi_.viewList });
    const texts = (select: HTMLElement) => [...select.querySelectorAll('option')].map((o) => o.textContent);
    expect(texts(groupSelect())).toEqual([vi_.groupStatus, vi_.groupSection, vi_.groupOwner, vi_.groupDue, vi_.groupPriority]);
    expect(texts(screen.getByRole('combobox', { name: vi_.doneWindow }))).toEqual([vi_.doneHide, vi_.done7, vi_.done30, vi_.doneAll]);
    expect((screen.getByRole('combobox', { name: vi_.doneWindow }) as HTMLSelectElement).value).toBe('30');
  });

  it("shows the project's own grouping while the address names none", async () => {
    const { fake, launch } = seeded();
    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${launch}` });
    await screen.findByRole('tab', { name: vi_.viewList });
    await waitFor(() => expect(groupSelect().value).toBe('section'));
  });

  it('groups a project with no grouping of its own by section when it has sections, else by status', async () => {
    const { fake } = seeded();
    const sectioned = fake.server.write('project', null, { name: 'Có hạng mục', managers: [MINH], members: [], status: 'active', default_group_by: null }, MINH).id;
    fake.server.write('section', null, { project: sectioned, name: 'Chuẩn bị', position: 1024 }, MINH);
    const bare = fake.server.write('project', null, { name: 'Không hạng mục', managers: [MINH], members: [], status: 'active', default_group_by: null }, MINH).id;

    const first = renderProjects(<App />, { fake, lang: 'vi', path: `/p/${sectioned}` });
    await screen.findByRole('tab', { name: vi_.viewList });
    await waitFor(() => expect(groupSelect().value).toBe('section'));
    first.unmount();

    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${bare}` });
    await screen.findByRole('tab', { name: vi_.viewList });
    await waitFor(() => expect(groupSelect().value).toBe('status'));
  });

  it('keeps an open drawer open while the view changes', async () => {
    const { fake, launch } = seeded();
    const task = fake.server.records('task').find((r) => r.body.title === 'Thiết kế màn hình đăng nhập')!.id;
    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${launch}/t/${task}` });
    fireEvent.click(await screen.findByRole('tab', { name: vi_.viewList }));
    expect(here()).toBe(`/p/${launch}/t/${task}?view=list`);
  });

  it('moves between the two views with the arrow keys, as one tab stop', async () => {
    const { fake, launch } = seeded();
    renderProjects(<App />, { fake, lang: 'vi', path: `/p/${launch}` });
    const board = await screen.findByRole('tab', { name: vi_.viewBoard });
    const list = screen.getByRole('tab', { name: vi_.viewList });
    expect(board.tabIndex).toBe(0);
    expect(list.tabIndex).toBe(-1);
    fireEvent.keyDown(board, { key: 'ArrowLeft' });
    expect(here()).toBe(`/p/${launch}?view=list`);
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('tab', { name: vi_.viewList })));
    expect(screen.getByRole('tab', { name: vi_.viewList }).tabIndex).toBe(0);
  });
});
