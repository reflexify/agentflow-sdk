// @vitest-environment jsdom
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BoardTasks } from '../../src/api/projects-api.js';
import { ProjectsError } from '../../src/api/projects-api.js';
import { HOA } from '../../src/api/seed.js';
import { keys } from '../../src/data/keys.js';
import { useClaim } from '../../src/data/useClaim.js';
import { renderProjects, TEST_NOW, toasts } from '../support/render.js';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

/** `useClaim` and the query cache it writes, from inside the providers. */
function probe() {
  const seen: { claim: ReturnType<typeof useClaim> | null; qc: QueryClient | null } = { claim: null, qc: null };
  function Probe() {
    seen.claim = useClaim();
    seen.qc = useQueryClient();
    return null;
  }
  return { ui: <Probe />, seen };
}

describe('useClaim', () => {
  it('shows the viewer at once, and on a refusal puts back only that task\'s holder', async () => {
    let refuse!: (e: unknown) => void;
    let calls = 0;
    const { ui, seen } = probe();
    const { fake } = renderProjects(ui, {
      you: HOA,
      api: (api) => ({ ...api, claim: () => { calls++; return new Promise<void>((_, reject) => { refuse = reject; }); } }),
    });
    await waitFor(() => expect(seen.claim).not.toBeNull());
    const launch = fake.server.records('project').find((r) => r.body.name === 'Ra mắt ứng dụng')!.id;
    const board = keys.board({ project: launch, done: '30', cancelled: false });
    const all = await fake.api.boardTasks({ project: launch, done: '30', cancelled: false });
    const free = all.tasks.find((t) => t.title === 'Chuẩn bị tài liệu bàn giao')!;
    const other = all.tasks.find((t) => t.title === 'Tích hợp cổng thanh toán')!;
    seen.qc!.setQueryData<BoardTasks>(board, all);
    // Kept out of the refetch the claim causes, so the test sees exactly what the claim wrote.
    seen.qc!.setQueryDefaults(['board'], { enabled: false, staleTime: Infinity });

    let pending!: Promise<boolean>;
    act(() => { pending = seen.claim!.claim(free); void seen.claim!.claim(free); });
    await waitFor(() => expect(seen.claim!.isPending(free.id)).toBe(true));
    await waitFor(() => expect(seen.qc!.getQueryData<BoardTasks>(board)!.tasks.find((t) => t.id === free.id)!.holder).toBe(HOA));
    expect(calls).toBe(1);

    // Something else changes in the board while the claim is in flight.
    const now = seen.qc!.getQueryData<BoardTasks>(board)!;
    seen.qc!.setQueryData<BoardTasks>(board, { ...now, tasks: now.tasks.map((t) => (t.id === other.id ? { ...t, title: 'Đổi tên trong lúc chờ' } : t)) });

    await act(async () => { refuse(new ProjectsError('refused', 422, 'VALIDATION_ERROR', 'Không nhận được task')); await pending; });
    const after = seen.qc!.getQueryData<BoardTasks>(board)!;
    expect(after.tasks.find((t) => t.id === free.id)!.holder).toBeNull();
    expect(after.tasks.find((t) => t.id === other.id)!.title).toBe('Đổi tên trong lúc chờ');
    expect(seen.claim!.isPending(free.id)).toBe(false);
    await waitFor(() => expect(toasts()).toContain('Không nhận được task'));
  });
});
