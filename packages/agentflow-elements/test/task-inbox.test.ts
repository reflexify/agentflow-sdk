import { describe, expect, it } from 'vitest';
import { CALLER, json, mount, problem, settle, shadow, stubApi } from './support.js';

const E = '0190c0de-0000-7000-8000-0000000000e1';
const T1 = '0190c0de-0000-7000-8000-00000000t001';
const T2 = '0190c0de-0000-7000-8000-00000000t002';
const line = (id: string, extra = {}) => ({
  id, entity_id: E, title: null, status: 'active', priority: 'normal', live: true, claimed_by_user_id: null,
  assigned_user_ids: [], assigned_group_ids: [], assigned_unit_ids: [], due_at: null, started_at: '2026-10-06T08:00:00Z', clock: null,
  step: {
    workflow: { id: 'w1', name: 'Claims' }, step: { key: 'review', label: `Review ${id.slice(-1)}` },
    kind: 'human', signs: false, subject: null,
  },
  ...extra,
});
const page = (...items: unknown[]) => ({ items, next_cursor: null, prev_cursor: null });

describe('<agentflow-task-inbox>', () => {
  it('lists the tasks of a view and fires task-select on a row', async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /work': () => json(200, page(line(T1), line(T2, { claimed_by_user_id: 'someone' }))),
    });
    const p = await mount('<agentflow-task-inbox page-size="10"></agentflow-task-inbox>', api);
    const inbox = p.querySelector('agentflow-task-inbox')!;
    const rows = shadow(inbox).querySelectorAll('[part="row"]');
    expect(rows).toHaveLength(2);
    expect(rows[0]!.textContent).toContain('Review 1');
    expect(rows[1]!.textContent).toContain('Claimed');
    const call = api.calls.find((c) => c.path === '/work')!;
    const query = new URLSearchParams(call.search);
    expect([query.get('view'), query.get('live'), query.get('limit')]).toEqual(['all', 'true', '10']);

    const picked: unknown[] = [];
    p.addEventListener('task-select', (e) => picked.push((e as CustomEvent).detail));
    (rows[1] as HTMLElement).click();
    expect(picked).toEqual([{ recordId: T2, entityId: E }]);
  });

  it('lists only the work a workflow step holds', async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /work': () => json(200, page(line(T1), line(T2, { step: undefined, title: 'A ticket' }))),
    });
    const p = await mount('<agentflow-task-inbox view="mine"></agentflow-task-inbox>', api);
    const rows = shadow(p.querySelector('agentflow-task-inbox')).querySelectorAll('[part="row"]');
    expect(rows).toHaveLength(1);
    expect(rows[0]!.textContent).toContain('Review 1');
    expect(new URLSearchParams(api.calls.find((c) => c.path === '/work')!.search).get('view')).toBe('mine');
  });

  it('shows the empty state and loads more pages by cursor', async () => {
    let page = 0;
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /work': (_r, url) => {
        page++;
        return url.searchParams.get('cursor') === 'c2'
          ? json(200, { items: [line(T2)], next_cursor: null, prev_cursor: null })
          : json(200, { items: [line(T1)], next_cursor: 'c2', prev_cursor: null });
      },
    });
    const p = await mount('<agentflow-task-inbox></agentflow-task-inbox>', api);
    const root = shadow(p.querySelector('agentflow-task-inbox'));
    (root.querySelector('[part="load-more"]') as HTMLButtonElement).click();
    await settle();
    expect(root.querySelectorAll('[part="row"]')).toHaveLength(2);
    expect(root.querySelector('[part="load-more"]')).toBeNull();
    expect(page).toBe(2);

    const empty = await mount('<agentflow-task-inbox></agentflow-task-inbox>', stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /work': () => json(200, { items: [], next_cursor: null, prev_cursor: null }),
    }));
    expect(shadow(empty.querySelector('agentflow-task-inbox')).querySelector('[part="empty"]')?.textContent).toContain('No tasks');
  });

  it('shows a problem inline and hands a 401 to the provider', async () => {
    const p = await mount('<agentflow-task-inbox></agentflow-task-inbox>', stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /work': () => problem(500, 'INTERNAL', { request_id: 'req-9' }),
    }));
    expect(shadow(p.querySelector('agentflow-task-inbox')).querySelector('[part="error"]')?.textContent).toContain('req-9');

    const out: unknown[] = [];
    document.body.addEventListener('signed-out', () => out.push(1));
    const p2 = await mount('<agentflow-task-inbox></agentflow-task-inbox>', stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /work': () => problem(401, 'NOT_SIGNED_IN'),
    }));
    expect(p2.dataset.state).toBe('signed-out');
    expect(out).toHaveLength(1);
  });

  it('renders in Vietnamese when the provider says so', async () => {
    const p = await mount('<agentflow-task-inbox></agentflow-task-inbox>', stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /work': () => json(200, { items: [], next_cursor: null, prev_cursor: null }),
    }), { locale: 'vi' });
    expect(shadow(p.querySelector('agentflow-task-inbox')).textContent).toContain('Không có công việc nào.');
  });

  it('asks for its view and 25 a page by default, and for all work when the view is not one it knows', async () => {
    const api = stubApi({ 'GET /caller': () => json(200, CALLER), 'GET /work': () => json(200, page()) });
    await mount('<agentflow-task-inbox view="claimable"></agentflow-task-inbox>', api);
    const sent = new URLSearchParams(api.calls.find((c) => c.path === '/work')!.search);
    expect(Object.fromEntries(sent)).toEqual({ view: 'claimable', live: 'true', limit: '25' });

    const plain = stubApi({ 'GET /caller': () => json(200, CALLER), 'GET /work': () => json(200, page()) });
    await mount('<agentflow-task-inbox></agentflow-task-inbox>', plain);
    expect(Object.fromEntries(new URLSearchParams(plain.calls.find((c) => c.path === '/work')!.search))).toEqual({
      view: 'all', live: 'true', limit: '25',
    });

    const unknown = stubApi({ 'GET /caller': () => json(200, CALLER), 'GET /work': () => json(200, page()) });
    await mount('<agentflow-task-inbox view="everything"></agentflow-task-inbox>', unknown);
    expect(new URLSearchParams(unknown.calls.find((c) => c.path === '/work')!.search).get('view')).toBe('all');
  });

  it('falls back to its defaults when the host removes view or page-size', async () => {
    const api = stubApi({ 'GET /caller': () => json(200, CALLER), 'GET /work': () => json(200, page()) });
    const p = await mount('<agentflow-task-inbox view="mine" page-size="10"></agentflow-task-inbox>', api);
    const inbox = p.querySelector('agentflow-task-inbox')!;
    inbox.removeAttribute('view');
    inbox.removeAttribute('page-size');
    await settle();
    const last = api.calls.filter((c) => c.path === '/work').at(-1)!;
    expect(Object.fromEntries(new URLSearchParams(last.search))).toEqual({ view: 'all', live: 'true', limit: '25' });
  });

  it('asks for 1 to 200 tasks a page, whatever page-size says', async () => {
    const limits: (string | null)[] = [];
    for (const size of ['0', '500', 'many']) {
      const api = stubApi({ 'GET /caller': () => json(200, CALLER), 'GET /work': () => json(200, page()) });
      await mount(`<agentflow-task-inbox page-size="${size}"></agentflow-task-inbox>`, api);
      limits.push(new URLSearchParams(api.calls.find((c) => c.path === '/work')!.search).get('limit'));
    }
    expect(limits).toEqual(['1', '200', '25']);
  });

  it('shows the due date in the viewer’s zone and falls back to the step key for the task', async () => {
    const p = await mount('<agentflow-task-inbox></agentflow-task-inbox>', stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /work': () => json(200, page(line(T1, { step: { ...line(T1).step, step: { key: 'review', label: '' } }, due_at: '2026-09-25T03:30:00Z' }))),
    }));
    const cells = [...shadow(p.querySelector('agentflow-task-inbox')).querySelectorAll('[part="row"] td')].map((td) =>
      td.textContent!.replace(/\s/g, ' '),
    );
    expect(cells).toEqual(['review', 'Claims', 'Open', 'Sep 25, 2026, 10:30 AM']);
  });

  it('claims no emptiness for tasks it has not loaded', async () => {
    const waiting = await mount('<agentflow-task-inbox></agentflow-task-inbox>', stubApi({
      'GET /caller': () => new Promise<Response>(() => {}),
    }));
    expect(waiting.dataset.state).toBe('loading');
    expect(shadow(waiting.querySelector('agentflow-task-inbox')).querySelector('[part="empty"]')).toBeNull();

    const out = await mount('<agentflow-task-inbox></agentflow-task-inbox>', stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /work': () => problem(401, 'NOT_SIGNED_IN'),
    }));
    expect(out.dataset.state).toBe('signed-out');
    expect(shadow(out.querySelector('agentflow-task-inbox')).querySelector('[part="empty"]')).toBeNull();
  });

  it('hides its rows and Load more once the session ends', async () => {
    const p = await mount('<agentflow-task-inbox></agentflow-task-inbox>', stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /work': (_r, url) =>
        url.searchParams.get('cursor') === 'c2'
          ? problem(401, 'NOT_SIGNED_IN')
          : json(200, { items: [line(T1)], next_cursor: 'c2', prev_cursor: null }),
    }));
    const root = shadow(p.querySelector('agentflow-task-inbox'));
    expect(root.querySelectorAll('[part="row"]')).toHaveLength(1);
    (root.querySelector('[part="load-more"]') as HTMLButtonElement).click();
    await settle();

    expect(p.dataset.state).toBe('signed-out');
    expect(root.querySelector('[part="row"]')).toBeNull();
    expect(root.querySelector('[part="load-more"]')).toBeNull();
  });

  it('keeps neither the old rows nor their cursor when a reload for a new view fails', async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /work': (_r, url) =>
        url.searchParams.get('view') === 'mine'
          ? json(200, { items: [line(T1)], next_cursor: 'c2', prev_cursor: null })
          : problem(500, 'INTERNAL'),
    });
    const p = await mount('<agentflow-task-inbox view="mine"></agentflow-task-inbox>', api);
    const inbox = p.querySelector('agentflow-task-inbox')!;
    expect(shadow(inbox).querySelector('[part="load-more"]')).not.toBeNull();
    inbox.setAttribute('view', 'claimable');
    await settle();

    expect(shadow(inbox).querySelector('[part="error"]')).not.toBeNull();
    expect(shadow(inbox).querySelectorAll('[part="row"]')).toHaveLength(0);
    expect(shadow(inbox).querySelector('[part="load-more"]')).toBeNull();
  });

  it('drops a page that answers a view the host has since changed', async () => {
    let answerOpen!: () => void;
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /work': (_r, url) =>
        url.searchParams.get('view') === 'mine'
          ? new Promise<Response>((resolve) => (answerOpen = () => resolve(json(200, page(line(T1))))))
          : json(200, page(line(T2, { claimed_by_user_id: 'someone' }))),
    });
    const p = await mount('<agentflow-task-inbox view="mine"></agentflow-task-inbox>', api);
    const inbox = p.querySelector('agentflow-task-inbox')!;
    inbox.setAttribute('view', 'claimable');
    await settle();
    answerOpen();
    await settle();

    const rows = shadow(inbox).querySelectorAll('[part="row"]');
    expect(rows).toHaveLength(1);
    expect(rows[0]!.textContent).toContain('Claimed');
    expect(shadow(inbox).textContent).not.toContain('Loading');
  });

  it('does not say there are no tasks while a first page with no step lines has more pages behind it', async () => {
    const p = await mount('<agentflow-task-inbox></agentflow-task-inbox>', stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /work': (_r, url) =>
        url.searchParams.get('cursor') === 'c2'
          ? json(200, { items: [line(T1)], next_cursor: null, prev_cursor: null })
          : json(200, { items: [line(T2, { step: undefined })], next_cursor: 'c2', prev_cursor: null }),
    }));
    const root = shadow(p.querySelector('agentflow-task-inbox'));
    expect(root.querySelector('[part="empty"]')).toBeNull();
    expect(root.querySelector('[part="load-more"]')).not.toBeNull();
    (root.querySelector('[part="load-more"]') as HTMLButtonElement).click();
    await settle();
    expect(root.querySelectorAll('[part="row"]')).toHaveLength(1);
  });
});
