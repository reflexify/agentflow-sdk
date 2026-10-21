// @vitest-environment jsdom
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFakeProjects } from '../../src/api/fake.js';
import { HOA } from '../../src/api/seed.js';
import { useTask, useTaskMutation } from '../../src/data/hooks.js';
import { TEXT } from '../../src/text.js';
import { renderProjects, toasts } from '../support/render.js';

afterEach(() => vi.restoreAllMocks());

const TITLE = 'Thiết kế màn hình đăng nhập';

function Probe({ id, onClient }: { id: string; onClient?: (qc: QueryClient) => void }) {
  const task = useTask(id);
  const { update } = useTaskMutation();
  onClient?.(useQueryClient());
  if (!task.data) return null;
  return <button type="button" onClick={() => void update(task.data!, { priority: 'low' })}>{task.data.title}</button>;
}

describe('a task write', () => {
  it('reports a fault that is not a server answer, and still says the change was not saved', async () => {
    const fake = createFakeProjects({ you: HOA });
    const id = fake.server.records('task').find((r) => r.body.title === TITLE)!.id;
    const fault = new TypeError('boom');
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    renderProjects(<Probe id={id} />, { fake, lang: 'vi', api: (api) => ({ ...api, updateTask: () => Promise.reject(fault) }) });
    fireEvent.click(await screen.findByRole('button', { name: TITLE }));
    await waitFor(() => expect(toasts()).toContain(TEXT.vi.saveFailed));
    expect(errors).toHaveBeenCalledWith(fault);
  });

  it('leaves nothing in the cache once the module is gone', async () => {
    const fake = createFakeProjects({ you: HOA });
    const id = fake.server.records('task').find((r) => r.body.title === TITLE)!.id;
    let client: QueryClient | null = null;
    const view = renderProjects(<Probe id={id} onClient={(qc) => { client = qc; }} />, { fake });
    await screen.findByRole('button', { name: TITLE });
    expect(client!.getQueryCache().getAll().length).toBeGreaterThan(0);
    act(() => view.unmount());
    expect(client!.getQueryCache().getAll()).toEqual([]);
  });
});
