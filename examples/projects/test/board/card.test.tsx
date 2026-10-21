// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeProjects } from '../../src/api/fake.js';
import type { ProjectsApi, TaskChanges } from '../../src/api/projects-api.js';
import { HOA, MINH } from '../../src/api/seed.js';
import { App } from '../../src/shell/App.js';
import { TEXT, t } from '../../src/text.js';
import { renderProjects, TEST_NOW, toasts } from '../support/render.js';
import { hoverTooltips } from '../support/tooltips.js';

const vi_ = TEXT.vi;
const css = readFileSync(join(process.cwd(), 'src/styles/projects.css'), 'utf8');

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

function seeded(you: string) {
  const fake = createFakeProjects({ you });
  const launch = fake.server.records('project').find((r) => r.body.name === 'Ra mắt ứng dụng')!.id;
  const task = (title: string) => fake.server.records('task').find((r) => r.body.title === title)!.id;
  const stored = (id: string) => fake.server.records('task').find((r) => r.id === id)!.body;
  const patches: TaskChanges[] = [];
  const api = (inner: ProjectsApi): ProjectsApi => ({
    ...inner,
    updateTask: (task, changes) => {
      patches.push(changes);
      return inner.updateTask(task, changes);
    },
  });
  return { fake, launch, task, stored, patches, api };
}

async function board(you: string, query = '') {
  const s = seeded(you);
  const view = renderProjects(<App />, { fake: s.fake, api: s.api, lang: 'vi', path: `/p/${s.launch}${query}` });
  await waitFor(() => expect(document.querySelectorAll('.board [data-task]').length).toBeGreaterThan(0));
  const card = (title: string) => document.querySelector(`.board [data-task="${s.task(title)}"]`) as HTMLElement;
  return { ...s, view, card };
}

const tooltipOf = (el: Element) => {
  hoverTooltips();
  return (el.closest('af-tooltip') as (HTMLElement & { text: string }) | null)?.text;
};
const part = (card: HTMLElement, name: string) => card.querySelector(`[data-part="${name}"]`) as HTMLElement | null;
const toastActions = () =>
  [...document.querySelectorAll('af-toast')].flatMap((el) => [...(el.shadowRoot?.querySelectorAll('[part="action"]') ?? [])]);

describe('the board card', () => {
  it('clips a long title with CSS and keeps the whole title in its tooltip', async () => {
    const { card } = await board(MINH);
    const title = part(card('Thiết kế màn hình đăng nhập'), 'title')!;
    expect(title.textContent).toBe('Thiết kế màn hình đăng nhập');
    expect(tooltipOf(title)).toBe('Thiết kế màn hình đăng nhập');
    expect(css).toMatch(/\.task-card\[data-variant="board"\] \.card-title \{[^}]*-webkit-line-clamp: 2/);
  });

  it('marks an open task past its due date as overdue, and never a done one', async () => {
    const { card } = await board(MINH);
    expect(part(card('Thiết kế luồng thanh toán'), 'due')!.querySelector('time')!.getAttribute('data-overdue')).toBe('true');
    const done = part(card('Thu thập yêu cầu từ khách hàng'), 'due')!.querySelector('time')!;
    expect(done.getAttribute('dateTime')).not.toBeNull();
    expect(done.hasAttribute('data-overdue')).toBe(false);
  });

  it('shows the label, the blocked chip, the checklist count and the attachment count', async () => {
    const { card } = await board(MINH);
    expect(part(card('Thiết kế màn hình đăng nhập'), 'label')!.textContent).toBe('Chờ duyệt');
    expect(part(card('Thiết kế luồng thanh toán'), 'blocked')!.textContent).toBe(vi_.blocked);
    const checklist = within(card('Thiết kế màn hình đăng nhập')).getByRole('img', { name: t('vi', 'checklistCount', { done: 2, total: 5 }) });
    expect(checklist.getAttribute('data-part')).toBe('checklist');
    expect(checklist.textContent).toBe('2/5');
    const files = within(card('Tích hợp cổng thanh toán')).getByRole('img', { name: t('vi', 'attachmentCount', { n: 1 }) });
    expect(files.getAttribute('data-part')).toBe('attachments');
    expect(files.textContent).toBe('1');
    expect(part(card('Thiết kế luồng thanh toán'), 'checklist')).toBeNull();
    expect(part(card('Thiết kế luồng thanh toán'), 'attachments')).toBeNull();
  });

  it('gives a label cut short a tooltip with its whole name, and one that fits none', async () => {
    const widths = vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.matches('[data-part="label"]') && this.textContent === 'Chờ duyệt' ? 300 : 0;
    });
    const client = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.matches('[data-part="label"]') ? 140 : 0;
    });
    try {
      const { card } = await board(MINH);
      await waitFor(() => expect(tooltipOf(part(card('Thiết kế màn hình đăng nhập'), 'label')!)).toBe('Chờ duyệt'));
      expect(part(card('Xây dựng API đăng nhập'), 'label')!.closest('af-tooltip')).toBeNull();
    } finally {
      widths.mockRestore();
      client.mockRestore();
    }
  });

  it('shows the status pill only when the board is grouped by section', async () => {
    const first = await board(MINH);
    expect(part(first.card('Thiết kế màn hình đăng nhập'), 'status')!.textContent).toBe(vi_.statusDoing);
    first.view.unmount();
    for (const group of ['status', 'priority', 'owner', 'due']) {
      const other = await board(MINH, `?group=${group}`);
      expect(part(other.card('Thiết kế màn hình đăng nhập'), 'status'), group).toBeNull();
      other.view.unmount();
    }
  });

  it('lists the unticked checklist items on a card that asks for them', async () => {
    const { card } = await board(MINH);
    const items = part(card('Thiết kế màn hình đăng nhập'), 'checklist-items')!;
    expect([...items.querySelectorAll('li')].map((li) => li.textContent)).toEqual(['Thiết kế trạng thái lỗi', 'Kiểm tra trên di động', 'Gửi duyệt']);
    expect(part(card('Tích hợp cổng thanh toán'), 'checklist-items')).toBeNull();
  });

  it('lets the primary tick, and locks the tick for a collaborator with the reason', async () => {
    const { card } = await board(HOA);
    const own = within(card('Thiết kế màn hình đăng nhập')).getByRole('button', { name: 'Hoàn thành: Thiết kế màn hình đăng nhập' });
    expect(own).toBe(part(card('Thiết kế màn hình đăng nhập'), 'tick'));
    expect(own.hasAttribute('aria-disabled')).toBe(false);
    const locked = part(card('Tích hợp cổng thanh toán'), 'tick')!;
    expect(locked.getAttribute('aria-disabled')).toBe('true');
    expect(tooltipOf(locked)).toBe(vi_.onlyPrimaryCompletes);
    expect(locked.getRootNode() instanceof Document && document.getElementById(locked.getAttribute('aria-describedby')!)?.textContent)
      .toBe(vi_.onlyPrimaryCompletes);
  });

  it('completes a todo task in one write, says so, and offers no undo', async () => {
    const { card, patches, stored, task } = await board(MINH);
    const id = task('Tích hợp cổng thanh toán');
    const tick = part(card('Tích hợp cổng thanh toán'), 'tick')!;
    fireEvent.click(tick);
    fireEvent.click(tick);
    await waitFor(() => expect(stored(id).status).toBe('done'));
    expect(patches).toEqual([{ status: 'done' }]);
    await waitFor(() => expect(toasts()).toContain(vi_.taskCompleted));
    expect(toastActions()).toHaveLength(0);
  });

  it("moves the section's done count with a tick", async () => {
    const { card } = await board(MINH);
    const heading = () => [...document.querySelectorAll('.board h3')].find((h) => h.textContent?.startsWith('Phát triển'))!;
    expect(heading().textContent).toBe('Phát triển · 0/2');
    fireEvent.click(part(card('Tích hợp cổng thanh toán'), 'tick')!);
    await waitFor(() => expect(heading().textContent).toBe('Phát triển · 1/2'));
  });

  it('completes a blocked task that is in progress, unblocking it in the same write', async () => {
    const { card, patches, stored, task } = await board(HOA);
    const id = task('Thiết kế luồng thanh toán');
    fireEvent.click(part(card('Thiết kế luồng thanh toán'), 'tick')!);
    await waitFor(() => expect(stored(id).status).toBe('done'));
    expect(patches).toEqual([{ status: 'done', blocked: false }]);
    expect(stored(id).blocked).not.toBe(true);
  });

  it('is an article whose title is the button that opens it, with the tick and claim beside it', async () => {
    const { card, task, launch } = await board(HOA);
    const article = card('Chuẩn bị tài liệu bàn giao');
    expect(article.tagName).toBe('ARTICLE');
    expect(article.hasAttribute('role')).toBe(false);
    const title = within(article).getByRole('button', { name: 'Chuẩn bị tài liệu bàn giao' });
    expect(title.getAttribute('data-part')).toBe('title');
    expect(title.contains(part(article, 'tick'))).toBe(false);
    expect(title.contains(part(article, 'claim'))).toBe(false);
    fireEvent.click(title);
    expect(window.location.pathname).toBe(`/p/${launch}/t/${task('Chuẩn bị tài liệu bàn giao')}`);
  });

  it('offers Nhận task on a task with no holder, and pressing it takes the task', async () => {
    const { card, stored, task } = await board(HOA);
    const id = task('Chuẩn bị tài liệu bàn giao');
    const claim = within(card('Chuẩn bị tài liệu bàn giao')).getByRole('button', { name: vi_.claim });
    expect(claim.hasAttribute('aria-disabled')).toBe(false);
    await act(async () => { fireEvent.click(claim); });
    await waitFor(() => expect(stored(id).claimed_by).toBe(HOA));
    await waitFor(() => expect(part(card('Chuẩn bị tài liệu bàn giao'), 'holder')).not.toBeNull());
    expect(part(card('Chuẩn bị tài liệu bàn giao'), 'claim')).toBeNull();
    expect(screen.queryAllByRole('button', { name: vi_.claim })).toHaveLength(0);
  });
});
