import type { AppTaskHandle, AppTaskState, AppTasks } from '@reflexify/agentflow-sdk';
import { describe, expect, it, vi } from 'vitest';
import { consumeTask } from '../src/index.js';
import { CALLER, json, mount, settle, stubApi } from './support.js';

type FakeHandle = AppTaskHandle & { push(patch: Partial<AppTaskState>): void; closed: boolean };

function fakeHandle(record: string, entity = 'ent-1'): FakeHandle {
  let state = { status: 'loading', record: { entity, id: record }, lastEvent: null } as unknown as AppTaskState;
  const listeners = new Set<(s: AppTaskState) => void>();
  const handle = {
    get state() {
      return state;
    },
    subscribe(listener: (s: AppTaskState) => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    close() {
      handle.closed = true;
      listeners.clear();
    },
    closed: false,
    push(patch: Partial<AppTaskState>) {
      state = { ...state, ...patch };
      for (const l of [...listeners]) l(state);
    },
  };
  return handle as unknown as FakeHandle;
}

function fakeTasks() {
  const handles: FakeHandle[] = [];
  const open = vi.fn((target: { record: string; entity?: string }) => {
    const h = fakeHandle(target.record, target.entity);
    handles.push(h);
    return h;
  });
  return { tasks: { open } as AppTasks, open, handles };
}

const api = () => stubApi({ 'GET /caller': () => json(200, CALLER) });
const taskOf = (el: Element) => {
  let seen: AppTaskHandle | null | undefined;
  const stop = consumeTask(el as HTMLElement, (t) => (seen = t));
  return {
    get current() {
      return seen;
    },
    stop,
  };
};

describe('<agentflow-task>', () => {
  it('a consumer inside the element gets the task, and state follows it', async () => {
    const { tasks, open, handles } = fakeTasks();
    const p = await mount('<agentflow-task record="r1"><span></span></agentflow-task>', api(), {}, { tasks });
    const el = p.querySelector('agentflow-task')!;
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith({ record: 'r1' });
    expect(el.getAttribute('state')).toBe('loading');
    const consumer = taskOf(p.querySelector('span')!);
    expect(consumer.current).toBe(handles[0]);

    for (const [status, state] of [
      ['ready', 'ready'],
      ['not_found', 'not-found'],
      ['finished', 'finished'],
      ['error', 'error'],
    ] as const) {
      handles[0]!.push({ status } as Partial<AppTaskState>);
      expect(el.getAttribute('state')).toBe(state);
    }

    el.setAttribute('record', 'r2');
    el.setAttribute('entity', 'ent-9');
    await settle();
    expect(handles[0]!.closed).toBe(true);
    expect(open).toHaveBeenLastCalledWith({ record: 'r2', entity: 'ent-9' });
    expect(consumer.current).toBe(handles.at(-1));
    expect(el.getAttribute('state')).toBe('loading');
  });

  it('the nearest element answers, so two tasks on one screen stay apart', async () => {
    const { tasks, handles } = fakeTasks();
    const p = await mount(
      '<agentflow-task record="outer"><b></b><agentflow-task record="inner"><i></i></agentflow-task></agentflow-task><u></u>',
      api(),
      {},
      { tasks },
    );
    const byRecord = (id: string) => handles.find((h) => h.state.record?.id === id);
    expect(taskOf(p.querySelector('i')!).current).toBe(byRecord('inner'));
    expect(taskOf(p.querySelector('b')!).current).toBe(byRecord('outer'));
    expect(taskOf(p.querySelector('u')!).current).toBeNull();
  });

  it('with no tasks on the provider the state is unsupported and nothing is opened', async () => {
    const p = await mount('<agentflow-task record="r1"><span></span></agentflow-task>', api());
    expect(p.querySelector('agentflow-task')!.getAttribute('state')).toBe('unsupported');
    expect(taskOf(p.querySelector('span')!).current).toBeNull();
  });

  it('a new event is dispatched once, bubbling and composed', async () => {
    const { tasks, handles } = fakeTasks();
    const p = await mount('<agentflow-task record="r1" entity="ent-attr"></agentflow-task>', api(), {}, { tasks });
    const seen: CustomEvent[] = [];
    const listener = (e: Event) => seen.push(e as CustomEvent);
    const kinds = ['submitted', 'claimed', 'changed'];
    for (const kind of kinds) document.addEventListener(`agentflow-task-${kind}`, listener);
    const h = handles[0]!;
    h.push({ status: 'ready', record: { entity: 'ent-1', id: 'r1' } });
    expect(seen).toHaveLength(0);

    h.push({ lastEvent: { kind: 'submitted', actionId: 'approve', seq: 1 } });
    h.push({ busy: true });
    h.push({ lastEvent: { kind: 'submitted', actionId: 'approve', seq: 1 } });
    expect(seen).toHaveLength(1);
    expect(seen[0]!.type).toBe('agentflow-task-submitted');
    expect(seen[0]!.bubbles).toBe(true);
    expect(seen[0]!.composed).toBe(true);
    expect(seen[0]!.detail).toEqual({ recordId: 'r1', entityId: 'ent-1', actionId: 'approve' });
    expect(seen[0]!.target).toBe(p.querySelector('agentflow-task'));

    h.push({ record: null, lastEvent: { kind: 'claimed', seq: 2 } });
    expect(seen).toHaveLength(2);
    expect(seen[1]!.type).toBe('agentflow-task-claimed');
    expect(seen[1]!.detail).toEqual({ recordId: 'r1', entityId: 'ent-attr' });
    for (const kind of kinds) document.removeEventListener(`agentflow-task-${kind}`, listener);
  });

  it('disconnecting closes the handle', async () => {
    const { tasks, handles } = fakeTasks();
    const p = await mount('<agentflow-task record="r1"><span></span></agentflow-task>', api(), {}, { tasks });
    const consumer = taskOf(p.querySelector('span')!);
    const el = p.querySelector('agentflow-task')!;
    expect(handles[0]!.closed).toBe(false);
    el.remove();
    await settle();
    expect(handles[0]!.closed).toBe(true);
    expect(consumer.current).toBeNull();
  });
});
