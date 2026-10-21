// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProjectsApi } from '../../src/api/projects-api.js';
import type { ProjectChanges } from '../../src/model/types.js';
import { HOA, LAN, MINH } from '../../src/api/seed.js';
import { App } from '../../src/shell/App.js';
import { TEXT } from '../../src/text.js';
import { TEST_NOW, renderProjects } from '../support/render.js';
import { seeded } from '../task/support.js';

const vi_ = TEXT.vi;
const Q3 = 'Kế hoạch quý 3';
const OLD_HINT = 'Quản lý có thể mở lại tại trang bản ghi của project';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

async function open(you: string, opts: { task?: string } = {}) {
  const s = seeded(you);
  const patches: ProjectChanges[] = [];
  const path = `/p/${s.project(Q3)}${opts.task ? `/t/${s.task(opts.task)}` : ''}`;
  const view = renderProjects(<App />, {
    fake: s.fake, lang: 'vi', path,
    api: (api: ProjectsApi) => ({ ...api, updateProject: (project, changes) => { patches.push(changes); return api.updateProject(project, changes); } }),
  });
  const banner = await waitFor(() => {
    const el = document.querySelector<HTMLElement>('.closed-banner');
    expect(el).toBeTruthy();
    return el!;
  });
  const stored = () => s.fake.server.records('project').find((r) => r.id === s.project(Q3))!.body;
  return { ...s, ...view, banner, patches, stored };
}

describe('the closed banner', () => {
  it('has dropped the hint from the module text', () => {
    expect('closedReopenHint' in TEXT.vi).toBe(false);
    expect('closedReopenHint' in TEXT.en).toBe(false);
  });

  it('gives a manager Mở lại in place of the hint, and reopens the project', async () => {
    const { banner, patches, stored, toasts } = await open(MINH);
    expect(within(banner).queryByText(OLD_HINT)).toBeNull();
    fireEvent.click(within(banner).getByRole('button', { name: vi_.reopenProject }));
    await waitFor(() => expect(stored().status).toBe('active'));
    expect(patches).toEqual([{ status: 'active' }]);
    await waitFor(() => expect(document.querySelector('.closed-banner')).toBeNull());
    expect(toasts()).toEqual([]);
  });

  it('gives a project admin who does not manage the project the same button', async () => {
    const { banner, stored } = await open(LAN);
    fireEvent.click(within(banner).getByRole('button', { name: vi_.reopenProject }));
    await waitFor(() => expect(stored().status).toBe('active'));
  });

  it('shows a member no button and no hint', async () => {
    const { banner } = await open(HOA);
    expect(within(banner).getByText(vi_.closedReadOnly)).toBeTruthy();
    expect(within(banner).queryByRole('button')).toBeNull();
    expect(screen.queryByText(OLD_HINT)).toBeNull();
  });

  it("sends one write for a double press, and says the server's reason when it refuses", async () => {
    const { banner, fake, patches, toasts, stored } = await open(MINH);
    fake.server.failNext('PATCH', /\/records\//, 422, {
      type: 'VALIDATION_ERROR', title: 'Unprocessable Entity', status: 422, detail: 'refused',
      field_errors: [{ path: '/status', message: 'Chưa mở lại được', rule: 'r' }],
    });
    const button = within(banner).getByRole('button', { name: vi_.reopenProject });
    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() => expect(toasts()).toContain('Chưa mở lại được'));
    expect(patches).toHaveLength(1);
    expect(stored().status).toBe('closed');
    expect(document.querySelector('.closed-banner')).toBeTruthy();
    // Pressable again once the refusal is in.
    expect(button.getAttribute('aria-disabled')).toBeNull();
  });

  it("offers the button in a task's drawer too, over its own project's page", async () => {
    const { stored } = await open(MINH, { task: 'Báo cáo ngân sách quý 3' });
    const drawer = await screen.findByRole('dialog', { name: 'Báo cáo ngân sách quý 3' });
    const inDrawer = await waitFor(() => {
      const el = drawer.querySelector<HTMLElement>('.closed-banner');
      expect(el).toBeTruthy();
      return el!;
    });
    expect(within(inDrawer).queryByText(OLD_HINT)).toBeNull();
    fireEvent.click(within(inDrawer).getByRole('button', { name: vi_.reopenProject }));
    await waitFor(() => expect(stored().status).toBe('active'));
    await act(async () => { await new Promise((r) => setTimeout(r, 30)); });
    expect(document.querySelector('.closed-banner')).toBeNull();
  });
});
