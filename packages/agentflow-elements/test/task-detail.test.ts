import { AgentFlowError } from '@reflexify/agentflow-sdk';
import { describe, expect, it } from 'vitest';
import { CALLER, json, mount, problem, reportOf, settle, shadow, stubApi } from './support.js';

const E = '0190c0de-0000-7000-8000-0000000000e1';
const E2 = '0190c0de-0000-7000-8000-0000000000e2';
const ID = '0190c0de-0000-7000-8000-00000000t001';
const OTHER = '0190c0de-0000-7000-8000-00000000t002';
const FORM = {
  schema_json: {
    type: 'object',
    required: ['decision'],
    'x-order': ['decision', 'note'],
    properties: {
      decision: { oneOf: [{ const: 'ok', title: 'Approve' }, { const: 'no', title: 'Reject' }] },
      note: { type: 'string', title: 'Note' },
    },
  },
};
const step = (extra = {}) => ({
  record_id: ID, entity_id: E, kind: 'human', signs: false, step_status: 'open', signed: false,
  run: { id: 'run-1', workflow_id: 'w1', workflow_name: 'Claims', step_key: 'review', step_label: 'Review claim' },
  instance_name: 'Case 7', subject: null,
  actions: [], actions_gated_out: false, signed_action_id: null, form_definition: FORM, draft_payload: null, prefill: null,
  entity_view: null, ...extra,
});
const otherStep = (extra = {}) => step({ record_id: OTHER, run: { ...step().run, step_label: 'Other step' }, ...extra });
const record = (claimedBy: string | null = null, name: string | null = null, id = ID, entity = E) => ({
  id, entity_id: entity, version: 1, created_at: '2026-10-06T08:00:00Z', updated_at: '2026-10-06T08:00:00Z',
  body: { title: null, claimed_by: claimedBy }, ref_labels: claimedBy && name ? { claimed_by: name } : {},
});
const mine = () => record(CALLER.id, 'Ann');
const work = (claimedBy: string | null = CALLER.id) => ({
  record_id: ID, active: true, claimed_by_user_id: claimedBy, claimed_at: claimedBy ? '2026-10-06T08:01:00Z' : null,
  assigned_user_ids: [], assigned_group_ids: [], assigned_unit_ids: [],
});
const stepPath = (id = ID, entity = E) => `/entities/${entity}/records/${id}/step`;
const recordPath = (id = ID, entity = E) => `/entities/${entity}/records/${id}`;
/** The two reads the element makes for one task. */
const reads = (s: unknown, r: unknown, id = ID, entity = E) => ({
  [`GET ${stepPath(id, entity)}`]: () => json(200, s),
  [`GET ${recordPath(id, entity)}`]: () => json(200, r),
});
const tag = (id = ID, entity = E) => `<agentflow-task-detail entity-id="${entity}" record-id="${id}"></agentflow-task-detail>`;
const el = (p: HTMLElement) => shadow(p.querySelector('agentflow-task-detail'));
const button = (p: HTMLElement, label: string) =>
  [...el(p).querySelectorAll('button')].find((b) => b.textContent?.trim() === label) as HTMLButtonElement | undefined;
const pointAt = (p: HTMLElement, id: string) => p.querySelector('agentflow-task-detail')!.setAttribute('record-id', id);
const pointAtEntity = (p: HTMLElement, entity: string) => p.querySelector('agentflow-task-detail')!.setAttribute('entity-id', entity);
const fieldOf = (p: HTMLElement, key: string) => el(p).querySelector(`#f-${key}`)!.closest('[part="field"]')!;
const title = (p: HTMLElement) => el(p).querySelector('[part="title"]')?.textContent;
const pending = () => {
  let answer!: (res: Response) => void;
  const promise = new Promise<Response>((resolve) => (answer = resolve));
  return { promise, answer };
};
const listen = (target: EventTarget, type: string) => {
  const seen: unknown[] = [];
  target.addEventListener(type, (e) => seen.push((e as CustomEvent).detail));
  return seen;
};

describe('<agentflow-task-detail>', () => {
  it('claims an open task and then shows its form', async () => {
    let held = false;
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET ${stepPath()}`]: () => json(200, step()),
      [`GET ${recordPath()}`]: () => json(200, held ? mine() : record()),
      [`POST ${recordPath()}/work/claim`]: () => {
        held = true;
        return json(200, work());
      },
    });
    const p = await mount(tag(), api);
    expect(el(p).querySelector('[part="form"]')).toBeNull();
    const seen = listen(p, 'task-claimed');
    button(p, 'Claim')!.click();
    await settle();
    expect(seen).toEqual([{ recordId: ID, entityId: E }]);
    expect(el(p).querySelector('[part="form"]')).not.toBeNull();
    expect(button(p, 'Release')).toBeDefined();
  });

  it('a claim that lost the race shows the problem and reloads', async () => {
    let reads = 0;
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET ${stepPath()}`]: () => {
        reads++;
        return json(200, step());
      },
      [`GET ${recordPath()}`]: () => json(200, reads === 1 ? record() : record('someone', 'Bob')),
      [`POST ${recordPath()}/work/claim`]: () => problem(409, 'WORK_ALREADY_CLAIMED'),
    });
    const p = await mount(tag(), api);
    button(p, 'Claim')!.click();
    await settle();
    expect(reads).toBe(2);
    expect(el(p).querySelector('[part="error"]')?.textContent).toContain('WORK_ALREADY_CLAIMED');
    expect(el(p).textContent).toContain('Claimed by Bob');
    expect(button(p, 'Claim')).toBeUndefined();
  });

  it('submits the values and fires task-submitted', async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      ...reads(step({ draft_payload: { decision: 'ok' } }), mine()),
      [`POST ${stepPath()}/submit`]: () => json(200, step({ step_status: 'submitted' })),
    });
    const p = await mount(tag(), api);
    const seen = listen(p, 'task-submitted');
    const note = el(p).querySelector('#f-note') as HTMLInputElement;
    note.value = 'fine';
    note.dispatchEvent(new Event('input'));
    button(p, 'Submit')!.click();
    await settle();
    expect(api.calls.find((c) => c.method === 'POST' && c.path.endsWith('/submit'))!.body).toEqual({ payload: { decision: 'ok', note: 'fine' } });
    expect(seen).toEqual([{ recordId: ID, entityId: E, actionId: null }]);
    expect(el(p).textContent).toContain('This task is complete.');
  });

  it('submits the chosen action with _action', async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      ...reads(step({ draft_payload: { decision: 'ok' }, actions: [{ id: 'approve', label: 'Approve it', edgeIds: ['e1'] }] }), mine()),
      [`POST ${stepPath()}/submit`]: () => json(200, step({ step_status: 'submitted' })),
    });
    const p = await mount(tag(), api);
    const seen = listen(p, 'task-submitted');
    expect(button(p, 'Submit')).toBeUndefined();
    button(p, 'Approve it')!.click();
    await settle();
    expect(api.calls.at(-1)!.body).toEqual({ payload: { decision: 'ok', _action: 'approve' } });
    expect(seen).toEqual([{ recordId: ID, entityId: E, actionId: 'approve' }]);
  });

  it('a schema refusal names no field, so the server’s reason is shown and the values are kept', async () => {
    // The step route joins the failing paths into `detail` and sends no field errors.
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      ...reads(step({ draft_payload: { decision: 'ok', note: 'from the draft' } }), mine()),
      [`POST ${stepPath()}/submit`]: () => problem(422, 'STEP_PAYLOAD_INVALID', { detail: '/note: must NOT have fewer than 5 characters' }),
    });
    const p = await mount(tag(), api);
    const note = el(p).querySelector('#f-note') as HTMLInputElement;
    note.value = 'typed';
    note.dispatchEvent(new Event('input'));
    button(p, 'Submit')!.click();
    await settle();
    expect(api.calls.at(-1)!.body).toEqual({ payload: { decision: 'ok', note: 'typed' } });
    const error = el(p).querySelector('[part="error"]')?.textContent ?? '';
    expect(error).toContain('STEP_PAYLOAD_INVALID');
    expect(error).toContain('/note: must NOT have fewer than 5 characters');
    expect(el(p).querySelector('[part="field-error"]')).toBeNull();
    expect((el(p).querySelector('#f-note') as HTMLInputElement).value).toBe('typed');
  });

  it('fills the form from prefill when there is no draft', async () => {
    const p = await mount(tag(), stubApi({
      'GET /caller': () => json(200, CALLER),
      ...reads(step({ draft_payload: null, prefill: { note: 'from prefill' } }), mine()),
    }));
    expect((el(p).querySelector('#f-note') as HTMLInputElement).value).toBe('from prefill');
  });

  it('blocks submit when a required field is empty and does not call the API', async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      ...reads(step(), mine()),
    });
    const p = await mount(tag(), api);
    button(p, 'Submit')!.click();
    await settle();
    expect(api.calls.some((c) => c.path.endsWith('/submit'))).toBe(false);
    expect(fieldOf(p, 'decision').querySelector('[part="field-error"]')?.textContent).toBe('Required');
  });

  it('offers no Submit when rules withhold every decision from the caller', async () => {
    const p = await mount(tag(), stubApi({
      'GET /caller': () => json(200, CALLER),
      ...reads(step({ draft_payload: { decision: 'ok' }, actions: [], actions_gated_out: true }), mine()),
    }));
    expect(button(p, 'Submit')).toBeUndefined();
    expect(button(p, 'Release')).toBeDefined();
    expect(el(p).textContent).toContain('There is no decision you can make on this task right now.');
  });

  it('leaves the signing action to AgentFlow and keeps the other actions', async () => {
    const sign = { id: 'sign', label: 'Sign it', edgeIds: ['e1'] };
    const approve = { id: 'approve', label: 'Approve it', edgeIds: ['e2'] };
    const labels = (p: HTMLElement) => [...el(p).querySelectorAll('[part="actions"] button')].map((b) => b.textContent?.trim());
    const withActions = (actions: unknown[]) =>
      mount(tag(), stubApi({
        'GET /caller': () => json(200, CALLER),
        ...reads(step({ draft_payload: { decision: 'ok' }, actions, signed_action_id: 'sign' }), mine()),
      }));

    const both = await withActions([sign, approve]);
    expect(labels(both)).toEqual(['Release', 'Approve it']);
    expect(el(both).textContent).toContain("Signing this task isn't available here. Open it in AgentFlow to sign.");

    const signOnly = await withActions([sign]);
    expect(labels(signOnly)).toEqual(['Release']);
    expect(el(signOnly).textContent).toContain("Signing this task isn't available here. Open it in AgentFlow to sign.");
  });

  it('sends a signer to AgentFlow: a signature task offers no form, no Submit and no actions', async () => {
    const p = await mount(tag(), stubApi({
      'GET /caller': () => json(200, CALLER),
      ...reads(
        step({ kind: 'signature', signs: true, draft_payload: { decision: 'ok' }, actions: [{ id: 'approve', label: 'Approve it', edgeIds: ['e1'] }] }),
        mine(),
      ),
    }));
    expect(el(p).textContent).toContain("Signing this task isn't available here. Open it in AgentFlow to sign.");
    expect([...el(p).querySelectorAll('button')].map((b) => b.textContent?.trim())).toEqual(['Release']);
    expect(el(p).querySelector('[part="field"]')).toBeNull();
  });

  it('offers nothing once the signature is recorded, though the step is still open, and says the owner finishes it', async () => {
    const p = await mount(tag(), stubApi({
      'GET /caller': () => json(200, CALLER),
      ...reads(step({ signs: true, signed: true, draft_payload: { decision: 'ok' } }), mine()),
    }));
    expect(el(p).querySelector('[part="notice"]')?.textContent).toContain("waiting on the workflow's owner");
    expect(el(p).textContent).not.toContain('This task is complete.');
    expect(el(p).querySelectorAll('button')).toHaveLength(0);
    expect(el(p).querySelector('[part="form"]')).toBeNull();
  });

  it('says the task is complete once the step is no longer open', async () => {
    for (const step_status of ['submitted', 'cancelled']) {
      const p = await mount(tag(), stubApi({
        'GET /caller': () => json(200, CALLER),
        ...reads(step({ step_status, signs: true, signed: true }), mine()),
      }));
      expect(el(p).textContent, step_status).toContain(step_status === 'cancelled' ? 'This task was withdrawn.' : 'This task is complete.');
      expect(el(p).textContent, step_status).not.toContain("waiting on the workflow's owner");
      expect(el(p).querySelectorAll('button')).toHaveLength(0);
    }
  });

  it('says the signature waits on the workflow’s owner in Vietnamese', async () => {
    const p = await mount(tag(), stubApi({
      'GET /caller': () => json(200, CALLER),
      ...reads(step({ signs: true, signed: true }), mine()),
    }), { locale: 'vi' });
    expect(el(p).querySelector('[part="notice"]')?.textContent).toContain('chủ sở hữu quy trình');
    expect(el(p).querySelectorAll('button')).toHaveLength(0);
  });

  it('names the holder from the record, and says someone holds it when the name is not told', async () => {
    const named = await mount(tag(), stubApi({ 'GET /caller': () => json(200, CALLER), ...reads(step(), record('someone', 'Bob')) }));
    expect(el(named).querySelector('[part="notice"]')?.textContent).toBe('Claimed by Bob');
    const unnamed = await mount(tag(), stubApi({ 'GET /caller': () => json(200, CALLER), ...reads(step(), record('someone')) }));
    expect(el(unnamed).querySelector('[part="notice"]')?.textContent).toBe('Someone else is working on this task.');
  });

  describe('a task whose entity view asks for records to be chosen', () => {
    const SELECT_ELSEWHERE = "Choosing records for this task isn't available here. Open it in AgentFlow to choose them.";
    const view = (extra = {}) => ({
      kind: 'collection', mode: 'selectable', min_selection: null, max_selection: null, surface_actions: false, unscopable: false,
      records: [], next_cursor: null, entity: { id: 'e' }, view: { id: 'v', type: 'grid' }, ...extra,
    });
    const labels = (p: HTMLElement) => [...el(p).querySelectorAll('button')].map((b) => b.textContent?.trim());
    const withView = (entityView: unknown, extra = {}, holder: unknown = mine()) =>
      mount(tag(), stubApi({
        'GET /caller': () => json(200, CALLER),
        ...reads(step({ draft_payload: { decision: 'ok' }, entity_view: entityView, ...extra }), holder),
      }));

    it('sends the person to AgentFlow and offers only Release', async () => {
      for (const entityView of [view(), view({ min_selection: 2 }), view({ view: { id: 'v', type: 'kanban' } })]) {
        const p = await withView(entityView);
        expect(el(p).querySelector('[part="notice"]')?.textContent, JSON.stringify(entityView)).toBe(SELECT_ELSEWHERE);
        expect(labels(p)).toEqual(['Release']);
        expect(el(p).querySelector('[part="field"]')).toBeNull();
      }
    });

    it('offers none of the task’s actions either', async () => {
      const p = await withView(view(), { actions: [{ id: 'approve', label: 'Approve it', edgeIds: ['e1'] }] });
      expect(labels(p)).toEqual(['Release']);
      expect(el(p).textContent).toContain(SELECT_ELSEWHERE);
    });

    it('is submitted here as usual when nothing has to be chosen', async () => {
      const notRequired = [
        view({ min_selection: 0 }),
        view({ mode: 'reference' }),
        // Only a grid or a kanban can tick records; the server asks nothing of any other view.
        view({ view: { id: 'v', type: 'calendar' } }),
        { kind: 'detail', entity_id: 'e', view_id: 'v', record_id: null, surface_actions: false },
        { kind: 'withheld' },
        null,
      ];
      for (const entityView of notRequired) {
        const p = await withView(entityView);
        expect(labels(p), JSON.stringify(entityView)).toEqual(['Release', 'Submit']);
        expect(el(p).textContent).not.toContain(SELECT_ELSEWHERE);
      }
    });

    it('shows the notice only to the person who claimed it', async () => {
      const open = await withView(view(), {}, record());
      expect(labels(open)).toEqual(['Claim']);
      expect(el(open).textContent).not.toContain(SELECT_ELSEWHERE);

      const theirs = await withView(view(), {}, record('someone', 'Bob'));
      expect(el(theirs).querySelector('[part="notice"]')?.textContent).toBe('Claimed by Bob');
      expect(labels(theirs)).toEqual([]);
    });
  });

  it('releases a claimed task', async () => {
    let released = false;
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET ${stepPath()}`]: () => json(200, step()),
      [`GET ${recordPath()}`]: () => json(200, released ? record() : mine()),
      [`POST ${recordPath()}/work/release`]: () => {
        released = true;
        return json(200, work(null));
      },
    });
    const p = await mount(tag(), api);
    const seen = listen(p, 'task-released');
    button(p, 'Release')!.click();
    await settle();
    expect(seen).toEqual([{ recordId: ID, entityId: E }]);
    expect(button(p, 'Claim')).toBeDefined();
  });

  describe('while the task loads', () => {
    const loadingLine = (p: HTMLElement) => el(p).textContent?.includes('Loading…') ?? false;

    it('shows the loading line until the task arrives', async () => {
      const first = pending();
      const p = await mount(tag(), stubApi({
        'GET /caller': () => json(200, CALLER),
        [`GET ${stepPath()}`]: () => first.promise,
        [`GET ${recordPath()}`]: () => json(200, record()),
      }));
      expect(loadingLine(p)).toBe(true);
      first.answer(json(200, step()));
      await settle();
      expect(loadingLine(p)).toBe(false);
      expect(title(p)).toBe('Review claim');
    });

    it('drops the loading line when the load fails', async () => {
      const p = await mount(tag(), stubApi({
        'GET /caller': () => json(200, CALLER),
        [`GET ${stepPath()}`]: () => problem(500, 'INTERNAL'),
        [`GET ${recordPath()}`]: () => json(200, record()),
      }));
      expect(el(p).querySelector('[part="error"]')).not.toBeNull();
      expect(loadingLine(p)).toBe(false);
    });

    it('keeps the loading line for the next task when a late answer for the one before lands', async () => {
      const first = pending();
      const p = await mount(tag(), stubApi({
        'GET /caller': () => json(200, CALLER),
        [`GET ${stepPath()}`]: () => first.promise,
        [`GET ${recordPath()}`]: () => json(200, record()),
        [`GET ${stepPath(OTHER)}`]: () => new Promise<Response>(() => {}),
        [`GET ${recordPath(OTHER)}`]: () => json(200, record(null, null, OTHER)),
      }));
      pointAt(p, OTHER);
      await settle();
      first.answer(json(200, step()));
      await settle();
      expect(loadingLine(p)).toBe(true);
    });

    it('drops the loading line when the host removes record-id', async () => {
      const p = await mount(tag(), stubApi({
        'GET /caller': () => json(200, CALLER),
        [`GET ${stepPath()}`]: () => new Promise<Response>(() => {}),
        [`GET ${recordPath()}`]: () => json(200, record()),
      }));
      expect(loadingLine(p)).toBe(true);
      p.querySelector('agentflow-task-detail')!.removeAttribute('record-id');
      await settle();
      expect(loadingLine(p)).toBe(false);
    });
  });

  it('shows a first load that fails, with its request id', async () => {
    const p = await mount(tag(), stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET ${stepPath()}`]: () => problem(500, 'INTERNAL'),
      [`GET ${recordPath()}`]: () => json(200, record()),
    }));
    const error = el(p).querySelector('[part="error"]');
    expect(error).not.toBeNull();
    expect(error?.textContent).toContain('INTERNAL');
    expect(error?.textContent).toContain('Request id: req-test');
    expect(el(p).querySelector('[part="title"]')).toBeNull();
  });

  it('shows nothing once the session ends', async () => {
    const p = await mount(tag(), stubApi({
      'GET /caller': () => json(200, CALLER),
      ...reads(step(), mine()),
    }));
    expect(title(p)).toBe('Review claim');
    expect(el(p).querySelectorAll('button').length).toBeGreaterThan(0);

    reportOf(p)(new AgentFlowError(401, 'NOT_SIGNED_IN'));
    await settle();

    expect(p.dataset.state).toBe('signed-out');
    expect(el(p).querySelector('[part="title"]')).toBeNull();
    expect(el(p).querySelector('[part="form"]')).toBeNull();
    expect(el(p).querySelectorAll('button')).toHaveLength(0);
  });

  describe('a step the reader may not open', () => {
    const withheld = (extra: Parameters<typeof stubApi>[0] = {}) =>
      stubApi({
        'GET /caller': () => json(200, CALLER),
        [`GET ${stepPath()}`]: () => problem(404, 'NOT_FOUND'),
        [`GET ${recordPath()}`]: () => json(200, record('someone', 'Bob')),
        ...extra,
      });

    it('says the form is shown only to the people the task is assigned to, when the step is not theirs to open', async () => {
      const p = await mount(tag(), withheld());
      expect(el(p).querySelector('[part="notice"]')?.textContent).toContain('assigned to');
      expect(el(p).querySelector('[part="error"]')).toBeNull();
      expect(el(p).querySelectorAll('button')).toHaveLength(0);
    });

    it('reports the record’s own problem when the record is gone too, not the notice', async () => {
      const p = await mount(tag(), withheld({ [`GET ${recordPath()}`]: () => problem(404, 'NOT_FOUND') }));
      expect(el(p).querySelector('[part="notice"]')).toBeNull();
      expect(el(p).querySelector('[part="error"]')?.textContent).toContain('NOT_FOUND');
    });

    it('says it in Vietnamese too', async () => {
      const p = await mount(tag(), withheld(), { locale: 'vi' });
      expect(el(p).querySelector('[part="notice"]')?.textContent).toContain('được giao');
    });

    it('drops the panel it showed when a reload after a release answers 404', async () => {
      let released = false;
      const p = await mount(tag(), stubApi({
        'GET /caller': () => json(200, CALLER),
        [`GET ${stepPath()}`]: () => (released ? problem(404, 'NOT_FOUND') : json(200, step())),
        [`GET ${recordPath()}`]: () => json(200, released ? record() : mine()),
        [`POST ${recordPath()}/work/release`]: () => {
          released = true;
          return json(200, work(null));
        },
      }));
      expect(title(p)).toBe('Review claim');
      button(p, 'Release')!.click();
      await settle();
      expect(title(p)).toBeUndefined();
      expect(el(p).querySelector('[part="form"]')).toBeNull();
      expect(el(p).querySelector('[part="notice"]')?.textContent).toContain('assigned to');
      expect(el(p).querySelector('[part="error"]')).toBeNull();
      expect(el(p).querySelectorAll('button')).toHaveLength(0);
    });

    it('drops the panel it showed when a reload answers 404 for the step and fails for the record too', async () => {
      let released = false;
      const p = await mount(tag(), stubApi({
        'GET /caller': () => json(200, CALLER),
        [`GET ${stepPath()}`]: () => (released ? problem(404, 'NOT_FOUND') : json(200, step())),
        [`GET ${recordPath()}`]: () => (released ? problem(404, 'NOT_FOUND') : json(200, mine())),
        [`POST ${recordPath()}/work/release`]: () => {
          released = true;
          return json(200, work(null));
        },
      }));
      expect(title(p)).toBe('Review claim');
      button(p, 'Release')!.click();
      await settle();
      expect(title(p)).toBeUndefined();
      expect(el(p).querySelector('[part="form"]')).toBeNull();
      expect(el(p).querySelectorAll('button')).toHaveLength(0);
      expect(el(p).querySelector('[part="notice"]')).toBeNull();
      expect(el(p).querySelector('[part="error"]')?.textContent).toContain('NOT_FOUND');
    });

    it('keeps it withheld when a claim’s reload answers 404, until the host points it at a task the reader may open', async () => {
      // The claim is refused and its reload answers 404; nothing re-opens the form until a read the
      // reader may make succeeds, which here is the next task the host points the element at.
      let reload = 0;
      const p = await mount(tag(), stubApi({
        'GET /caller': () => json(200, CALLER),
        [`GET ${stepPath()}`]: () => {
          reload++;
          return reload === 1 ? json(200, step()) : problem(404, 'NOT_FOUND');
        },
        [`GET ${recordPath()}`]: () => json(200, record()),
        [`POST ${recordPath()}/work/claim`]: () => problem(409, 'WORK_ALREADY_CLAIMED'),
        ...reads(otherStep(), mine(), OTHER),
      }));
      button(p, 'Claim')!.click();
      await settle();
      expect(el(p).querySelector('[part="notice"]')?.textContent).toContain('assigned to');
      expect(el(p).querySelector('[part="form"]')).toBeNull();
      expect(title(p)).toBeUndefined();

      pointAt(p, OTHER);
      await settle();
      expect(title(p)).toBe('Other step');
      expect(el(p).textContent).not.toContain('assigned to');
    });

    it('does not withhold the task the host moved to when a 404 lands for the one before', async () => {
      const late = pending();
      const p = await mount(tag(), stubApi({
        'GET /caller': () => json(200, CALLER),
        [`GET ${stepPath()}`]: () => late.promise,
        [`GET ${recordPath()}`]: () => json(200, record()),
        ...reads(otherStep(), record(null, null, OTHER), OTHER),
      }));
      pointAt(p, OTHER);
      await settle();
      late.answer(problem(404, 'NOT_FOUND'));
      await settle();
      expect(title(p)).toBe('Other step');
      expect(el(p).textContent).not.toContain('assigned to');
    });
  });

  it('shows the task the host points at last, never a late answer for the one before', async () => {
    let answerFirst!: () => void;
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET ${stepPath()}`]: () => new Promise<Response>((resolve) => (answerFirst = () => resolve(json(200, step())))),
      [`GET ${recordPath()}`]: () => json(200, record()),
      ...reads(otherStep(), record(null, null, OTHER), OTHER),
    });
    const p = await mount(tag(), api);
    pointAt(p, OTHER);
    await settle();
    expect(title(p)).toBe('Other step');
    answerFirst();
    await settle();
    expect(title(p)).toBe('Other step');
    expect(el(p).textContent).not.toContain('Review claim');
  });

  it('shows no late failure for the task it has left, but still reports it', async () => {
    let failFirst!: () => void;
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET ${stepPath()}`]: () => new Promise<Response>((resolve) => (failFirst = () => resolve(problem(500, 'INTERNAL')))),
      [`GET ${recordPath()}`]: () => json(200, record()),
      ...reads(otherStep(), record(null, null, OTHER), OTHER),
    });
    const p = await mount(tag(), api);
    const failed = listen(p, 'request-failed');
    pointAt(p, OTHER);
    await settle();
    failFirst();
    await settle();
    expect(title(p)).toBe('Other step');
    expect(el(p).querySelector('[part="error"]')).toBeNull();
    expect(failed).toEqual([expect.objectContaining({ code: 'INTERNAL', status: 500 })]);
  });

  describe('a 401 that lands after the host moved on still ends the session', () => {
    const signedOutLate = async (routes: Parameters<typeof stubApi>[0], act: (p: HTMLElement) => void, answer: () => void) => {
      const p = await mount(tag(), stubApi({
        'GET /caller': () => json(200, CALLER),
        [`GET ${recordPath()}`]: () => json(200, record()),
        ...reads(otherStep(), record(null, null, OTHER), OTHER),
        ...routes,
      }));
      act(p);
      await settle();
      pointAt(p, OTHER);
      await settle();
      expect(title(p)).toBe('Other step');
      answer();
      await settle();
      return p;
    };

    it('from a load', async () => {
      const late = pending();
      const p = await signedOutLate({ [`GET ${stepPath()}`]: () => late.promise }, () => {}, () => late.answer(problem(401, 'NOT_SIGNED_IN')));
      expect(p.dataset.state).toBe('signed-out');
    });

    it('from a claim', async () => {
      const late = pending();
      const p = await signedOutLate(
        { [`GET ${stepPath()}`]: () => json(200, step()), [`POST ${recordPath()}/work/claim`]: () => late.promise },
        (provider) => button(provider, 'Claim')!.click(),
        () => late.answer(problem(401, 'NOT_SIGNED_IN')),
      );
      expect(p.dataset.state).toBe('signed-out');
    });

    it('from a submit', async () => {
      const late = pending();
      const p = await signedOutLate(
        {
          [`GET ${stepPath()}`]: () => json(200, step({ draft_payload: { decision: 'ok' } })),
          [`GET ${recordPath()}`]: () => json(200, mine()),
          [`POST ${stepPath()}/submit`]: () => late.promise,
        },
        (provider) => button(provider, 'Submit')!.click(),
        () => late.answer(problem(401, 'NOT_SIGNED_IN')),
      );
      expect(p.dataset.state).toBe('signed-out');
    });
  });

  it('offers no form for the task it has left while the next one loads', async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      ...reads(step({ draft_payload: { decision: 'ok' } }), mine()),
      [`GET ${stepPath(OTHER)}`]: () => new Promise<Response>(() => {}),
      [`GET ${recordPath(OTHER)}`]: () => json(200, record(null, null, OTHER)),
      [`POST ${stepPath(OTHER)}/submit`]: () => json(200, otherStep({ step_status: 'submitted' })),
    });
    const p = await mount(tag(), api);
    expect(button(p, 'Submit')).toBeDefined();
    pointAt(p, OTHER);
    await settle();
    button(p, 'Submit')?.click();
    await settle();
    expect(api.calls.some((c) => c.method === 'POST' && c.path.includes(OTHER))).toBe(false);
    expect(el(p).querySelector('[part="form"]')).toBeNull();
  });

  it('a claim that lands after the host moved on names the task it claimed and does not show it', async () => {
    let answerClaim!: () => void;
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      ...reads(step(), record()),
      [`POST ${recordPath()}/work/claim`]: () => new Promise<Response>((resolve) => (answerClaim = () => resolve(json(200, work())))),
      ...reads(otherStep(), record(null, null, OTHER), OTHER),
    });
    const p = await mount(tag(), api);
    const seen = listen(p, 'task-claimed');
    button(p, 'Claim')!.click();
    await settle();
    pointAt(p, OTHER);
    await settle();
    answerClaim();
    await settle();
    expect(seen).toEqual([{ recordId: ID, entityId: E }]);
    expect(title(p)).toBe('Other step');
    expect(el(p).querySelector('[part="form"]')).toBeNull();
    expect(button(p, 'Claim')!.disabled).toBe(false);
  });

  it('a submit that lands after the host moved on names the task it submitted and leaves the next one alone', async () => {
    let answerSubmit!: () => void;
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      ...reads(step({ draft_payload: { decision: 'ok' } }), mine()),
      [`POST ${stepPath()}/submit`]: () => new Promise<Response>((resolve) => (answerSubmit = () => resolve(json(200, step({ step_status: 'submitted' }))))),
      ...reads(otherStep(), record(null, null, OTHER), OTHER),
    });
    const p = await mount(tag(), api);
    const seen = listen(p, 'task-submitted');
    button(p, 'Submit')!.click();
    await settle();
    pointAt(p, OTHER);
    await settle();
    answerSubmit();
    await settle();
    expect(seen).toEqual([{ recordId: ID, entityId: E, actionId: null }]);
    expect(title(p)).toBe('Other step');
    expect(el(p).textContent).not.toContain('This task is complete.');
    expect(button(p, 'Claim')).toBeDefined();
  });

  it('shows the finished panel only after the submit has answered', async () => {
    const late = pending();
    const p = await mount(tag(), stubApi({
      'GET /caller': () => json(200, CALLER),
      ...reads(step({ draft_payload: { decision: 'ok' } }), mine()),
      [`POST ${stepPath()}/submit`]: () => late.promise,
    }));
    button(p, 'Submit')!.click();
    await settle();
    expect(el(p).textContent).not.toContain('This task is complete.');
    expect(el(p).querySelector('[part="form"]')).not.toBeNull();
    late.answer(json(200, step({ step_status: 'submitted' })));
    await settle();
    expect(el(p).textContent).toContain('This task is complete.');
  });

  it('a submit that lands after only the entity changed names the entity it wrote and leaves the next task alone', async () => {
    const late = pending();
    const p = await mount(tag(), stubApi({
      'GET /caller': () => json(200, CALLER),
      ...reads(step({ draft_payload: { decision: 'ok' } }), mine()),
      [`POST ${stepPath()}/submit`]: () => late.promise,
      ...reads(step({ entity_id: E2, run: { ...step().run, step_label: 'Other entity step' } }), record(null, null, ID, E2), ID, E2),
    }));
    const seen = listen(p, 'task-submitted');
    button(p, 'Submit')!.click();
    await settle();
    pointAtEntity(p, E2);
    await settle();
    expect(title(p)).toBe('Other entity step');
    late.answer(json(200, step({ step_status: 'submitted' })));
    await settle();
    expect(seen).toEqual([{ recordId: ID, entityId: E, actionId: null }]);
    expect(title(p)).toBe('Other entity step');
    expect(el(p).textContent).not.toContain('This task is complete.');
    expect(button(p, 'Claim')).toBeDefined();
  });

  it('a claim that lands after only the entity changed names the entity it wrote and does not reload the one it left', async () => {
    const late = pending();
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      ...reads(step(), record()),
      [`POST ${recordPath()}/work/claim`]: () => late.promise,
      ...reads(step({ entity_id: E2, run: { ...step().run, step_label: 'Other entity step' } }), record(null, null, ID, E2), ID, E2),
    });
    const p = await mount(tag(), api);
    const seen = listen(p, 'task-claimed');
    button(p, 'Claim')!.click();
    await settle();
    pointAtEntity(p, E2);
    await settle();
    const reloads = api.calls.filter((c) => c.method === 'GET' && c.path === stepPath(ID, E)).length;
    late.answer(json(200, work()));
    await settle();
    expect(seen).toEqual([{ recordId: ID, entityId: E }]);
    expect(title(p)).toBe('Other entity step');
    expect(api.calls.filter((c) => c.method === 'GET' && c.path === stepPath(ID, E))).toHaveLength(reloads);
  });
});
