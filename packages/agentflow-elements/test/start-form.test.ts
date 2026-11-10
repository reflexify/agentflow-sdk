import { AgentFlowError } from '@reflexify/agentflow-sdk';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { defineFolderSource } from '../src/index.js';
import { CALLER, json, mount, problem, reportOf, settle, shadow, stubApi } from './support.js';

const W = '0190c0de-0000-7000-8000-0000000000w1';
const V = '0190c0de-0000-7000-8000-0000000000v1';
const I = '0190c0de-0000-7000-8000-0000000000i1';
const W2 = '0190c0de-0000-7000-8000-0000000000w2';
const V2 = '0190c0de-0000-7000-8000-0000000000v2';
const SECOND = { id: W2, name: 'Close a claim', version_id: V2 };
const startable = { items: [{ id: W, name: 'Open a claim', version_id: V }], next_cursor: null, prev_cursor: null };
const startForm = {
  form_definition: { schema_json: { type: 'object', required: ['amount'], properties: { amount: { type: 'number', title: 'Amount' } } } },
  version_updated_at: '2026-09-25T00:00:00Z',
};
const root = (p: HTMLElement) => shadow(p.querySelector('agentflow-start-form'));
const click = (p: HTMLElement, label: string) =>
  [...root(p).querySelectorAll('button')].find((b) => b.textContent?.trim() === label)!.click();
const type = (p: HTMLElement, id: string, value: string) => {
  const input = root(p).querySelector(`#${id}`) as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input'));
};
const NO_FORM = { form_definition: null, version_updated_at: '2026-09-25T00:00:00Z' };
// A start that binds no form is described by its contract alone, which these workflows leave empty.
const NO_PARAMS = { published: true, version_id: V, form_definition_id: null, subject: { kind: 'none' }, params_slots: [] };
const both = { ...startable, items: [...startable.items, SECOND] };
const button = (p: HTMLElement, label: string) =>
  [...root(p).querySelectorAll('button')].find((b) => b.textContent?.trim() === label) as HTMLButtonElement | undefined;
const fieldOf = (p: HTMLElement, key: string) => root(p).querySelector(`#f-${key}`)!.closest('[part="field"]')!;
const caseName = (p: HTMLElement) => (root(p).querySelector('#f-__name') as HTMLInputElement | null)?.value;
const nameAt = (p: HTMLElement, id: string) => p.querySelector('agentflow-start-form')!.setAttribute('workflow-id', id);
const pick = (p: HTMLElement, id: string) => {
  const picker = root(p).querySelector('[part="picker"] select') as HTMLSelectElement;
  picker.value = id;
  picker.dispatchEvent(new Event('change'));
};
const posts = <C extends { method: string }>(api: { calls: C[] }) => api.calls.filter((c) => c.method === 'POST');
const listen = (target: EventTarget, type: string) => {
  const seen: unknown[] = [];
  target.addEventListener(type, (e) => seen.push((e as CustomEvent).detail));
  return seen;
};
const later = () => {
  let answer!: (res: Response) => void;
  const promise = new Promise<Response>((resolve) => (answer = resolve));
  return { promise, answer };
};

const appObjects = (logical_key: string, id: string | null, state = 'active') => ({
  revision: 1,
  objects: [{ logical_key, id, state, source: 'own', kind: logical_key.split(':')[0], key: logical_key.split(':')[1], contract: null, contract_version: null, customized: false, feature: null, parent: null }],
});

describe('<agentflow-start-form>', () => {
  it('starts the named workflow with the case name and the form values', async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /workflows/startable': () => json(200, startable),
      [`GET /workflow-versions/${V}/start-form`]: () => json(200, startForm),
      [`POST /workflows/${W}/instances`]: () => json(201, { id: I, status: 'running' }),
    });
    const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, api);
    expect((root(p).querySelector('#f-__name') as HTMLInputElement).value).toBe('Open a claim');
    type(p, 'f-amount', '250');
    const seen: unknown[] = [];
    p.addEventListener('workflow-started', (e) => seen.push((e as CustomEvent).detail));
    click(p, 'Start');
    await settle();
    expect(api.calls.at(-1)!.body).toEqual({ name: 'Open a claim', version_id: V, input_payload: { amount: 250 } });
    expect(seen).toEqual([{ instanceId: I, workflowId: W }]);
  });

  describe('after a successful start', () => {
    const api = () =>
      stubApi({
        'GET /caller': () => json(200, CALLER),
        'GET /workflows/startable': () => json(200, both),
        [`GET /workflow-versions/${V}/start-form`]: () => json(200, startForm),
        [`GET /workflow-versions/${V2}/start-form`]: () => json(200, NO_FORM),
        [`GET /workflows/${W2}/input-contract`]: () => json(200, NO_PARAMS),
        [`POST /workflows/${W}/instances`]: () => json(201, { id: I, status: 'running' }),
      });
    const notices = (p: HTMLElement) => [...root(p).querySelectorAll('[part="notice"]')].map((n) => n.textContent?.trim());
    const amount = (p: HTMLElement) => (root(p).querySelector('#f-amount') as HTMLInputElement).value;

    it('says it started and resets the form, and still fires workflow-started', async () => {
      const stub = api();
      const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, stub);
      const seen = listen(p, 'workflow-started');
      expect(notices(p)).toEqual([]);
      type(p, 'f-__name', 'Claim 12');
      type(p, 'f-amount', '250');
      button(p, 'Start')!.click();
      await settle();
      expect(seen).toEqual([{ instanceId: I, workflowId: W }]);
      expect(notices(p)).toEqual(['Started.']);
      expect(caseName(p)).toBe('Open a claim');
      expect(amount(p)).toBe('');
      expect(button(p, 'Start')!.disabled).toBe(false);
    });

    it('cannot start the same values again with a second click', async () => {
      const stub = api();
      const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, stub);
      type(p, 'f-amount', '250');
      button(p, 'Start')!.click();
      await settle();
      button(p, 'Start')!.click();
      await settle();
      expect(posts(stub)).toHaveLength(1);
      expect(fieldOf(p, 'amount').querySelector('[part="field-error"]')?.textContent).toBe('Required');
      expect(notices(p)).toEqual([]);
    });

    it('drops the notice when another workflow is shown', async () => {
      const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, api());
      type(p, 'f-amount', '250');
      button(p, 'Start')!.click();
      await settle();
      expect(notices(p)).toEqual(['Started.']);
      nameAt(p, W2);
      await settle();
      expect(caseName(p)).toBe('Close a claim');
      expect(notices(p)).toEqual([]);
    });
  });

  describe('while it loads', () => {
    const loadingLine = (p: HTMLElement) => root(p).textContent?.includes('Loading…') ?? false;

    it('shows the loading line until the named workflow’s form arrives', async () => {
      const catalog = later();
      const form = later();
      const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, stubApi({
        'GET /caller': () => json(200, CALLER),
        'GET /workflows/startable': () => catalog.promise,
        [`GET /workflow-versions/${V}/start-form`]: () => form.promise,
      }));
      expect(loadingLine(p)).toBe(true);
      catalog.answer(json(200, startable));
      await settle();
      expect(loadingLine(p)).toBe(true);
      form.answer(json(200, startForm));
      await settle();
      expect(loadingLine(p)).toBe(false);
      expect(caseName(p)).toBe('Open a claim');
    });

    it('shows the loading line while a picked workflow’s form loads', async () => {
      const form = later();
      const p = await mount('<agentflow-start-form></agentflow-start-form>', stubApi({
        'GET /caller': () => json(200, CALLER),
        'GET /workflows/startable': () => json(200, startable),
        [`GET /workflow-versions/${V}/start-form`]: () => form.promise,
        [`GET /workflows/${W}/input-contract`]: () => json(200, NO_PARAMS),
      }));
      expect(loadingLine(p)).toBe(false);
      pick(p, W);
      await settle();
      expect(loadingLine(p)).toBe(true);
      form.answer(json(200, NO_FORM));
      await settle();
      expect(loadingLine(p)).toBe(false);
    });

    it('drops the loading line when the picker goes back to no workflow', async () => {
      const p = await mount('<agentflow-start-form></agentflow-start-form>', stubApi({
        'GET /caller': () => json(200, CALLER),
        'GET /workflows/startable': () => json(200, startable),
        [`GET /workflow-versions/${V}/start-form`]: () => new Promise<Response>(() => {}),
      }));
      pick(p, W);
      await settle();
      expect(loadingLine(p)).toBe(true);
      pick(p, '');
      await settle();
      expect(loadingLine(p)).toBe(false);
    });

    it('drops the loading line when a load fails, or the workflow cannot be started', async () => {
      const failed = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, stubApi({
        'GET /caller': () => json(200, CALLER),
        'GET /workflows/startable': () => json(200, startable),
        [`GET /workflow-versions/${V}/start-form`]: () => problem(500, 'INTERNAL'),
      }));
      expect(root(failed).querySelector('[part="error"]')).not.toBeNull();
      expect(loadingLine(failed)).toBe(false);

      const catalogFailed = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, stubApi({
        'GET /caller': () => json(200, CALLER),
        'GET /workflows/startable': () => problem(500, 'INTERNAL'),
      }));
      expect(root(catalogFailed).querySelector('[part="error"]')).not.toBeNull();
      expect(loadingLine(catalogFailed)).toBe(false);

      const refused = await mount(`<agentflow-start-form workflow-id="${W2}"></agentflow-start-form>`, stubApi({
        'GET /caller': () => json(200, CALLER),
        'GET /workflows/startable': () => json(200, startable),
      }));
      expect(root(refused).textContent).toContain("can't be started here");
      expect(loadingLine(refused)).toBe(false);
    });

    it('keeps the loading line for the next workflow when a late form for the one before lands', async () => {
      const first = later();
      const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, stubApi({
        'GET /caller': () => json(200, CALLER),
        'GET /workflows/startable': () => json(200, both),
        [`GET /workflow-versions/${V}/start-form`]: () => first.promise,
        [`GET /workflow-versions/${V2}/start-form`]: () => new Promise<Response>(() => {}),
      }));
      nameAt(p, W2);
      await settle();
      first.answer(problem(500, 'INTERNAL'));
      await settle();
      expect(loadingLine(p)).toBe(true);
    });
  });

  it('offers a picker when no workflow is named', async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /workflows/startable': () => json(200, startable),
      [`GET /workflow-versions/${V}/start-form`]: () => json(200, { form_definition: null, version_updated_at: '2026-09-25T00:00:00Z' }),
      [`GET /workflows/${W}/input-contract`]: () => json(200, NO_PARAMS),
    });
    const p = await mount('<agentflow-start-form></agentflow-start-form>', api);
    const picker = root(p).querySelector('[part="picker"] select') as HTMLSelectElement;
    picker.value = W;
    picker.dispatchEvent(new Event('change'));
    await settle();
    expect(root(p).querySelector('#f-__name')).not.toBeNull();
    expect(root(p).querySelector('#f-amount')).toBeNull();
  });

  it('says so when the named workflow cannot be started here', async () => {
    const p = await mount(`<agentflow-start-form workflow-id="0190c0de-0000-7000-8000-0000000000zz"></agentflow-start-form>`, stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /workflows/startable': () => json(200, startable),
    }));
    expect(root(p).querySelector('[part="error"]')?.textContent).toContain("can't be started here");
  });

  it('refuses to start without a case name', async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /workflows/startable': () => json(200, startable),
      [`GET /workflow-versions/${V}/start-form`]: () => json(200, { form_definition: null, version_updated_at: 'x' }),
      [`GET /workflows/${W}/input-contract`]: () => json(200, NO_PARAMS),
    });
    const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, api);
    type(p, 'f-__name', '');
    click(p, 'Start');
    await settle();
    expect(api.calls.some((c) => c.method === 'POST')).toBe(false);
  });

  describe('the case name', () => {
    const api = () =>
      stubApi({
        'GET /caller': () => json(200, CALLER),
        'GET /workflows/startable': () => json(200, startable),
        [`GET /workflow-versions/${V}/start-form`]: () => json(200, NO_FORM),
        [`GET /workflows/${W}/input-contract`]: () => json(200, NO_PARAMS),
        [`POST /workflows/${W}/instances`]: () => json(201, { id: I, status: 'running' }),
      });

    it('is missing when it is only spaces', async () => {
      const stub = api();
      const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, stub);
      type(p, 'f-__name', '   ');
      button(p, 'Start')!.click();
      await settle();
      expect(fieldOf(p, '__name').querySelector('[part="field-error"]')?.textContent).toBe('Required');
      expect(posts(stub)).toEqual([]);
    });

    it('is sent trimmed', async () => {
      const stub = api();
      const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, stub);
      type(p, 'f-__name', '  Claim 7  ');
      button(p, 'Start')!.click();
      await settle();
      expect(stub.calls.find((c) => c.method === 'POST')!.body).toEqual({ name: 'Claim 7', version_id: V, input_payload: {} });
    });
  });

  it('walks every page of the catalog, 100 at a time', async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /workflows/startable': (_r, url) =>
        url.searchParams.get('cursor') === 'c2'
          ? json(200, { items: [SECOND], next_cursor: null, prev_cursor: 'c1' })
          : json(200, { ...startable, next_cursor: 'c2' }),
      [`GET /workflow-versions/${V2}/start-form`]: () => json(200, NO_FORM),
      [`GET /workflows/${W2}/input-contract`]: () => json(200, NO_PARAMS),
    });
    const p = await mount(`<agentflow-start-form workflow-id="${W2}"></agentflow-start-form>`, api);
    expect(caseName(p)).toBe('Close a claim');
    const pages = api.calls.filter((c) => c.path === '/workflows/startable').map((c) => new URLSearchParams(c.search));
    expect(pages.map((q) => q.get('limit'))).toEqual(['100', '100']);
    expect(pages.map((q) => q.get('cursor'))).toEqual([null, 'c2']);
  });

  describe('a form with a required field it cannot edit', () => {
    const api = () =>
      stubApi({
        'GET /caller': () => json(200, CALLER),
        'GET /workflows/startable': () => json(200, startable),
        [`GET /workflow-versions/${V}/start-form`]: () =>
          json(200, {
            form_definition: { schema_json: { type: 'object', required: ['photo'], properties: { photo: { type: 'object', title: 'Photo' } } } },
            version_updated_at: '2026-09-25T00:00:00Z',
          }),
        [`POST /workflows/${W}/instances`]: () => json(201, { id: I, status: 'running' }),
      });

    it('blocks Start and says why', async () => {
      const stub = api();
      const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, stub);
      expect(button(p, 'Start')!.disabled).toBe(true);
      const notices = [...root(p).querySelectorAll('[part="notice"]')].map((n) => n.textContent);
      expect(notices).toContain("This form has a required field that can't be edited here.");
      button(p, 'Start')!.click();
      await settle();
      expect(posts(stub)).toEqual([]);
    });

    it('starts nothing even when the button is enabled behind its back', async () => {
      const stub = api();
      const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, stub);
      const start = button(p, 'Start')!;
      start.removeAttribute('disabled');
      start.click();
      await settle();
      expect(posts(stub)).toEqual([]);
    });
  });

  it('sends one start for a double click', async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /workflows/startable': () => json(200, startable),
      [`GET /workflow-versions/${V}/start-form`]: () => json(200, startForm),
      [`POST /workflows/${W}/instances`]: () => json(201, { id: I, status: 'running' }),
    });
    const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, api);
    type(p, 'f-amount', '250');
    const start = button(p, 'Start')!;
    start.click();
    start.click();
    await settle();
    expect(posts(api)).toHaveLength(1);
  });

  it('clears the Required mark once a start goes through', async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /workflows/startable': () => json(200, startable),
      [`GET /workflow-versions/${V}/start-form`]: () => json(200, NO_FORM),
      [`GET /workflows/${W}/input-contract`]: () => json(200, NO_PARAMS),
      [`POST /workflows/${W}/instances`]: () => json(201, { id: I, status: 'running' }),
    });
    const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, api);
    type(p, 'f-__name', '');
    button(p, 'Start')!.click();
    await settle();
    expect(root(p).querySelector('[part="field-error"]')?.textContent).toBe('Required');
    type(p, 'f-__name', 'Claim 12');
    button(p, 'Start')!.click();
    await settle();
    expect(posts(api)).toHaveLength(1);
    expect(root(p).querySelector('[part="field-error"]')).toBeNull();
  });

  describe('when a request fails', () => {
    it('puts a refused start’s errors beside their fields, keeps the values and allows another try', async () => {
      const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, stubApi({
        'GET /caller': () => json(200, CALLER),
        'GET /workflows/startable': () => json(200, startable),
        [`GET /workflow-versions/${V}/start-form`]: () => json(200, startForm),
        [`POST /workflows/${W}/instances`]: () =>
          problem(400, 'SUBMISSION_VALIDATION', { field_errors: [{ path: '/amount', message: 'too big', rule: 'maximum' }] }),
      }));
      type(p, 'f-amount', '999999');
      button(p, 'Start')!.click();
      await settle();
      expect(fieldOf(p, 'amount').querySelector('[part="field-error"]')?.textContent).toBe('too big');
      expect(fieldOf(p, '__name').querySelector('[part="field-error"]')).toBeNull();
      expect((root(p).querySelector('#f-amount') as HTMLInputElement).value).toBe('999999');
      expect(caseName(p)).toBe('Open a claim');
      expect(root(p).querySelector('[part="error"]')?.textContent).toContain('SUBMISSION_VALIDATION');
      expect(button(p, 'Start')!.disabled).toBe(false);
    });

    it('shows a catalog that fails part-way as a problem, not as a workflow it cannot start', async () => {
      const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, stubApi({
        'GET /caller': () => json(200, CALLER),
        'GET /workflows/startable': (_r, url) =>
          url.searchParams.get('cursor') ? problem(500, 'INTERNAL') : json(200, { ...startable, next_cursor: 'c2' }),
      }));
      expect(root(p).querySelector('[part="error"]')?.textContent).toContain('INTERNAL');
      expect(root(p).textContent).not.toContain("can't be started here");
      expect(root(p).querySelector('[part="form"]')).toBeNull();
    });

    it('shows a start form that fails to load as a problem', async () => {
      const p = await mount('<agentflow-start-form></agentflow-start-form>', stubApi({
        'GET /caller': () => json(200, CALLER),
        'GET /workflows/startable': () => json(200, startable),
        [`GET /workflow-versions/${V}/start-form`]: () => problem(500, 'INTERNAL'),
      }));
      pick(p, W);
      await settle();
      expect(root(p).querySelector('[part="error"]')?.textContent).toContain('INTERNAL');
      expect(root(p).querySelector('[part="form"]')).toBeNull();
    });
  });

  it('shows nothing once the session ends', async () => {
    const p = await mount('<agentflow-start-form></agentflow-start-form>', stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /workflows/startable': () => json(200, startable),
      [`GET /workflow-versions/${V}/start-form`]: () => json(200, startForm),
    }));
    pick(p, W);
    await settle();
    expect(root(p).querySelector('[part="form"]')).not.toBeNull();

    reportOf(p)(new AgentFlowError(401, 'NOT_SIGNED_IN'));
    await settle();

    expect(p.dataset.state).toBe('signed-out');
    expect(root(p).querySelector('[part="picker"]')).toBeNull();
    expect(root(p).querySelector('[part="form"]')).toBeNull();
    expect(root(p).querySelectorAll('button')).toHaveLength(0);
  });

  it('offers no picker before the session is ready', async () => {
    const p = await mount('<agentflow-start-form></agentflow-start-form>', stubApi({
      'GET /caller': () => new Promise<Response>(() => {}),
    }));
    expect(p.dataset.state).toBe('loading');
    expect(root(p).querySelector('[part="picker"]')).toBeNull();
  });

  it('offers no form while nothing is picked', async () => {
    const p = await mount('<agentflow-start-form></agentflow-start-form>', stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /workflows/startable': () => json(200, startable),
      [`GET /workflow-versions/${V}/start-form`]: () => json(200, startForm),
    }));
    pick(p, W);
    await settle();
    expect(root(p).querySelector('[part="form"]')).not.toBeNull();
    pick(p, '');
    await settle();
    expect(root(p).querySelector('[part="form"]')).toBeNull();
  });

  describe('when the workflow changes', () => {
    it('shows the workflow the host names last, never a late form for the one before', async () => {
      const first = later();
      const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, stubApi({
        'GET /caller': () => json(200, CALLER),
        'GET /workflows/startable': () => json(200, both),
        [`GET /workflow-versions/${V}/start-form`]: () => first.promise,
        [`GET /workflow-versions/${V2}/start-form`]: () => json(200, NO_FORM),
        [`GET /workflows/${W2}/input-contract`]: () => json(200, NO_PARAMS),
      }));
      nameAt(p, W2);
      await settle();
      expect(caseName(p)).toBe('Close a claim');
      first.answer(json(200, startForm));
      await settle();
      expect(caseName(p)).toBe('Close a claim');
      expect(root(p).querySelector('#f-amount')).toBeNull();
    });

    it('shows the workflow picked last, never a late form for the one before', async () => {
      const first = later();
      const p = await mount('<agentflow-start-form></agentflow-start-form>', stubApi({
        'GET /caller': () => json(200, CALLER),
        'GET /workflows/startable': () => json(200, both),
        [`GET /workflow-versions/${V}/start-form`]: () => first.promise,
        [`GET /workflow-versions/${V2}/start-form`]: () => json(200, NO_FORM),
        [`GET /workflows/${W2}/input-contract`]: () => json(200, NO_PARAMS),
      }));
      pick(p, W);
      await settle();
      pick(p, W2);
      await settle();
      first.answer(json(200, startForm));
      await settle();
      expect(caseName(p)).toBe('Close a claim');
      expect(root(p).querySelector('#f-amount')).toBeNull();
    });

    it('offers no form for the workflow it has left while the next one loads', async () => {
      const api = stubApi({
        'GET /caller': () => json(200, CALLER),
        'GET /workflows/startable': () => json(200, both),
        [`GET /workflow-versions/${V}/start-form`]: () => json(200, startForm),
        [`GET /workflow-versions/${V2}/start-form`]: () => new Promise<Response>(() => {}),
      });
      const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, api);
      expect(button(p, 'Start')).toBeDefined();
      nameAt(p, W2);
      await settle();
      expect(root(p).querySelector('[part="form"]')).toBeNull();
      expect(button(p, 'Start')).toBeUndefined();
    });

    it('forgets that the last workflow could not be started', async () => {
      const p = await mount(`<agentflow-start-form workflow-id="0190c0de-0000-7000-8000-0000000000zz"></agentflow-start-form>`, stubApi({
        'GET /caller': () => json(200, CALLER),
        'GET /workflows/startable': () => json(200, startable),
        [`GET /workflow-versions/${V}/start-form`]: () => json(200, NO_FORM),
        [`GET /workflows/${W}/input-contract`]: () => json(200, NO_PARAMS),
      }));
      expect(root(p).querySelector('[part="error"]')).not.toBeNull();
      nameAt(p, W);
      await settle();
      expect(root(p).querySelector('[part="error"]')).toBeNull();
      expect(caseName(p)).toBe('Open a claim');
    });

    it('drops a late catalog asked for the workflow named before', async () => {
      const first = later();
      let pages = 0;
      const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, stubApi({
        'GET /caller': () => json(200, CALLER),
        'GET /workflows/startable': () => (++pages === 1 ? first.promise : json(200, both)),
        [`GET /workflow-versions/${V2}/start-form`]: () => json(200, NO_FORM),
        [`GET /workflows/${W2}/input-contract`]: () => json(200, NO_PARAMS),
      }));
      nameAt(p, W2);
      await settle();
      expect(caseName(p)).toBe('Close a claim');
      first.answer(json(200, startable));
      await settle();
      expect(root(p).querySelector('[part="error"]')).toBeNull();
      expect(caseName(p)).toBe('Close a claim');
    });

    describe('a start still in flight', () => {
      async function startThenSwitch(answer: Response) {
        const started = later();
        const api = stubApi({
          'GET /caller': () => json(200, CALLER),
          'GET /workflows/startable': () => json(200, both),
          [`GET /workflow-versions/${V}/start-form`]: () => json(200, startForm),
          [`GET /workflow-versions/${V2}/start-form`]: () => json(200, startForm),
          [`POST /workflows/${W}/instances`]: () => started.promise,
        });
        const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, api);
        const seen = listen(p, 'workflow-started');
        type(p, 'f-amount', '250');
        button(p, 'Start')!.click();
        await settle();
        nameAt(p, W2);
        await settle();
        type(p, 'f-amount', '7');
        started.answer(answer);
        await settle();
        return { p, seen };
      }

      it('names the workflow it started and leaves the next form alone', async () => {
        const { p, seen } = await startThenSwitch(json(201, { id: I, status: 'running' }));
        expect(seen).toEqual([{ instanceId: I, workflowId: W }]);
        expect(caseName(p)).toBe('Close a claim');
        expect((root(p).querySelector('#f-amount') as HTMLInputElement).value).toBe('7');
        expect(button(p, 'Start')!.disabled).toBe(false);
        expect(root(p).querySelector('[part="notice"]')).toBeNull();
      });

      it('puts none of its errors on the next form', async () => {
        const { p, seen } = await startThenSwitch(
          problem(400, 'SUBMISSION_VALIDATION', { field_errors: [{ path: '/amount', message: 'Too small' }] }),
        );
        expect(seen).toEqual([]);
        expect(root(p).querySelector('[part="field-error"]')).toBeNull();
        expect(root(p).querySelector('[part="error"]')).toBeNull();
        expect((root(p).querySelector('#f-amount') as HTMLInputElement).value).toBe('7');
      });
    });
  });

  describe('with a record', () => {
    const E = '0190c0de-0000-7000-8000-0000000000e1';
    const R = '0190c0de-0000-7000-8000-0000000000r1';
    const A = '0190c0de-0000-7000-8000-0000000000a1';
    const F = '0190c0de-0000-7000-8000-0000000000f1';
    const action = (input_map: { from: string; to: string }[], mode: string) => ({ id: A, key: 'add_files', label: 'Add files', workflow_id: W, input_map, mode });
    const entity = (input_map: { from: string; to: string }[], mode: string) => ({
      id: E, key: 'batch', name: 'Batch', fields: [], actions: [action(input_map, mode)], browser_config: { display_field: 'code', facets: [] },
    });
    const record = { id: R, entity_id: E, body: { code: 'B-7' } };
    const contract = (keys: string[]) => ({
      published: true, version_id: V, form_definition_id: keys.length > 0 ? F : null, subject: { kind: 'record' },
      params_slots: keys.map((key) => ({ key, required: false })),
    });
    const paramsForm = {
      form_definition: {
        schema_json: {
          type: 'object',
          required: ['priority'],
          properties: { batch_code: { type: 'string', title: 'Batch' }, priority: { type: 'string', title: 'Priority' }, note: { type: 'string', title: 'Note' } },
        },
      },
      version_updated_at: '2026-09-25T00:00:00Z',
    };
    const BOUND = [{ from: 'record.code', to: 'params.batch_code' }, { from: 'default', to: 'params.priority' }];
    const api = (input_map: { from: string; to: string }[], slots: string[], start: () => Response, mode = 'async', poll?: () => Response) =>
      stubApi({
        'GET /caller': () => json(200, CALLER),
        'GET /app/objects': () => json(200, appObjects('entity:batch', E)),
        [`GET /entities/${E}`]: () => json(200, entity(input_map, mode)),
        [`GET /entities/${E}/records/${R}`]: () => json(200, record),
        [`GET /workflows/${W}/input-contract`]: () => json(200, contract(slots)),
        [`GET /workflow-versions/${V}/start-form`]: () => json(200, paramsForm),
        [`POST /workflows/${W}/instances`]: start,
        ...(poll ? { [`GET /instances/${I}`]: poll } : {}),
      });
    const ELEMENT = `<agentflow-start-form entity="batch" record="${R}" action="add_files"></agentflow-start-form>`;
    const context = { entity_id: E, action_id: A, record_id: R };

    it('launches a record action with the record as subject and no name to type', async () => {
      const stub = api(BOUND, ['batch_code', 'priority', 'note'], () => json(201, { id: I, status: 'running' }));
      const p = await mount(ELEMENT, stub);
      const seen = listen(p, 'workflow-started');
      expect(root(p).querySelector('#f-__name')).toBeNull();
      expect(root(p).querySelector('[part="picker"]')).toBeNull();
      // The record's value is a default the person may change; a key left to the field's own default is not asked for.
      expect((root(p).querySelector('#f-batch_code') as HTMLInputElement).value).toBe('B-7');
      expect(root(p).querySelector('#f-priority')).toBeNull();
      type(p, 'f-batch_code', 'B-8');
      type(p, 'f-note', 'two boxes');
      click(p, 'Start');
      await settle();
      expect(stub.calls.at(-1)!.body).toEqual({
        name: 'Add files · B-7',
        subject: { kind: 'record', record_id: R },
        params: { batch_code: 'B-8', note: 'two boxes' },
        version_id: V,
        action_context: context,
      });
      expect(seen).toEqual([{ instanceId: I, workflowId: W }]);
      expect(stub.calls.some((c) => c.path === '/workflows/startable')).toBe(false);
    });

    it('omits a prefilled param the person cleared', async () => {
      const stub = api(BOUND, ['batch_code', 'priority', 'note'], () => json(201, { id: I, status: 'running' }));
      const p = await mount(ELEMENT, stub);
      type(p, 'f-batch_code', '');
      click(p, 'Start');
      await settle();
      expect((stub.calls.at(-1)!.body as { params: unknown }).params).toStrictEqual({});
    });

    it('offers only Start when the action leaves nothing to fill in', async () => {
      const stub = api([{ from: 'record.code', to: 'params.batch_code' }], [], () => json(201, { id: I, status: 'running' }));
      const p = await mount(ELEMENT, stub);
      expect(root(p).querySelector('[part="input"]')).toBeNull();
      expect(root(p).textContent).toContain('Add files · B-7');
      click(p, 'Start');
      await settle();
      expect(stub.calls.at(-1)!.body).toEqual({
        name: 'Add files · B-7',
        subject: { kind: 'record', record_id: R },
        params: { batch_code: 'B-7' },
        version_id: V,
        action_context: context,
      });
      expect(stub.calls.some((c) => c.path.endsWith('/start-form'))).toBe(false);
    });

    it('says the action is not available when the server refuses it as not visible', async () => {
      const stub = api(BOUND, ['batch_code', 'priority', 'note'], () => problem(409, 'ACTION_NOT_VISIBLE'));
      const p = await mount(ELEMENT, stub);
      const seen = listen(p, 'workflow-started');
      click(p, 'Start');
      await settle();
      expect([...root(p).querySelectorAll('[part="notice"]')].map((n) => n.textContent?.trim())).toEqual([
        "This action isn't available on this record. Reload and try again.",
      ]);
      expect(root(p).querySelector('[part="error"]')).toBeNull();
      expect(button(p, 'Start')).toBeUndefined();
      expect(seen).toEqual([]);
    });

    describe('a sync action', () => {
      const POLL_MS = 2000;
      const POLLS = 15;
      const run = (status: string, more: Record<string, unknown> = {}) => ({ id: I, status, ...more });
      const sync = (start: () => Response, poll?: () => Response) => api([], [], start, 'sync', poll);
      const notices = (p: HTMLElement) => [...root(p).querySelectorAll('[part="notice"]')].map((n) => n.textContent?.trim());
      const polls = (stub: { calls: { path: string }[] }) => stub.calls.filter((c) => c.path === `/instances/${I}`).length;
      const tick = async () => {
        await vi.advanceTimersByTimeAsync(POLL_MS);
        await settle();
      };
      // The clock still creeps a millisecond at a time, so settle()'s zero-delay waits fire while a poll's two seconds do not.
      const fakeTimers = () => vi.useFakeTimers({ shouldAdvanceTime: true, advanceTimeDelta: 1 });
      afterEach(() => vi.useRealTimers());

      // How a run can come out, the outcome the page hears and the line the person reads, whichever read brings the answer.
      const SETTLED: [Record<string, unknown>, string, string][] = [
        [run('completed'), 'completed', 'Done.'],
        [run('completed', { outcome_label: 'Filed under B-7' }), 'completed', 'Filed under B-7'],
        [run('failed'), 'failed', 'Something went wrong.'],
        [run('failed', { error_message: 'No such batch' }), 'failed', 'No such batch'],
        [run('cancelled'), 'failed', 'Something went wrong.'],
        [run('failed', { last_rollback: { node_id: 'n1', node_label: 'Save files', code: 'X', message: 'disk full', attempt: [] } }), 'rolled_back', 'Nothing was saved. Save files failed: disk full'],
        [run('paused'), 'paused', 'Submitted — now in progress.'],
        [run('paused', { auth_blocked: { at: '2026-11-09T00:00:00Z', entity_id: E, operation: 'update', reason: 'no_grant' } }), 'blocked', 'Authorization blocked. An administrator needs to resume this run.'],
      ];

      it("waits for a sync action's result", async () => {
        for (const [answer, outcome, text] of SETTLED) {
          const stub = sync(() => json(200, answer));
          const p = await mount(ELEMENT, stub);
          const seen = listen(p, 'workflow-started');
          click(p, 'Start');
          await settle();
          expect(stub.calls.at(-1)!.body).toMatchObject({ action_context: context, wait_ms: 5000 });
          expect(notices(p)).toEqual([text]);
          expect(seen).toEqual([{ instanceId: I, workflowId: W, outcome }]);
          expect(polls(stub)).toBe(0);
        }
      });

      it('keeps polling a sync run that outlives the request, then shows its outcome', async () => {
        fakeTimers();
        const answers = [run('running'), run('completed')];
        const stub = sync(() => json(202, run('running')), () => json(200, answers.shift() ?? run('completed')));
        const p = await mount(ELEMENT, stub);
        const seen = listen(p, 'workflow-started');
        click(p, 'Start');
        await settle();
        expect(notices(p)).toEqual(['Working…']);
        expect(button(p, 'Start')!.disabled).toBe(true);
        expect([polls(stub), seen]).toEqual([0, []]);
        await tick();
        expect([polls(stub), notices(p), seen]).toEqual([1, ['Working…'], []]);
        await tick();
        expect(notices(p)).toEqual(['Done.']);
        expect(seen).toEqual([{ instanceId: I, workflowId: W, outcome: 'completed' }]);
        expect(button(p, 'Start')!.disabled).toBe(false);
        await tick();
        expect(polls(stub)).toBe(2);
      });

      it('shows how a run that outlives the request came out, however it ended', async () => {
        fakeTimers();
        for (const [answer, outcome, text] of SETTLED) {
          const stub = sync(() => json(202, run('running')), () => json(200, answer));
          const p = await mount(ELEMENT, stub);
          const seen = listen(p, 'workflow-started');
          click(p, 'Start');
          await settle();
          expect([notices(p), seen], text).toEqual([['Working…'], []]);
          await tick();
          expect(notices(p), text).toEqual([text]);
          expect(seen, text).toEqual([{ instanceId: I, workflowId: W, outcome }]);
          expect(button(p, 'Start')!.disabled, text).toBe(false);
          await tick();
          expect(polls(stub), text).toBe(1);
        }
      });

      it('gives up on a run still going at the deadline, and stops polling when it is removed', async () => {
        fakeTimers();
        const stub = sync(() => json(202, run('running')), () => json(200, run('running')));
        const p = await mount(ELEMENT, stub);
        const seen = listen(p, 'workflow-started');
        click(p, 'Start');
        await settle();
        for (let i = 0; i < POLLS; i++) await tick();
        expect(notices(p)).toEqual(['Started.']);
        expect(seen).toEqual([{ instanceId: I, workflowId: W, outcome: 'started' }]);
        await tick();
        expect(polls(stub)).toBe(POLLS);

        const form = p.querySelector('agentflow-start-form')!;
        const heard = listen(form, 'workflow-started');
        click(p, 'Start');
        await settle();
        await tick();
        expect(polls(stub)).toBe(POLLS + 1);
        form.remove();
        await settle();
        // The run goes on without the form, so whoever listens still hears of it.
        expect(heard).toEqual([{ instanceId: I, workflowId: W, outcome: 'started' }]);
        await tick();
        await tick();
        expect(polls(stub)).toBe(POLLS + 1);
      });

      it('reads nothing for a form removed while its start is still held', async () => {
        fakeTimers();
        const held = later();
        const stub = sync(() => held.promise as unknown as Response, () => json(200, run('running')));
        const p = await mount(ELEMENT, stub);
        const form = p.querySelector('agentflow-start-form')!;
        const heard = listen(form, 'workflow-started');
        click(p, 'Start');
        await settle();
        form.remove();
        await settle();
        held.answer(json(202, run('running')));
        await settle();
        await tick();
        await tick();
        expect(polls(stub)).toBe(0);
        expect(heard).toEqual([{ instanceId: I, workflowId: W, outcome: 'started' }]);
      });

      it("shows started when the run's status cannot be read", async () => {
        fakeTimers();
        for (const refusal of [() => problem(403, 'APP_CEILING_DENIED'), () => problem(404, 'NOT_FOUND')]) {
          const stub = sync(() => json(202, run('running')), refusal);
          const p = await mount(ELEMENT, stub);
          const seen = listen(p, 'workflow-started');
          const failed = listen(p, 'request-failed');
          click(p, 'Start');
          await settle();
          await tick();
          expect(notices(p)).toEqual(['Started.']);
          expect(root(p).querySelector('[part="error"]')).toBeNull();
          expect(failed).toEqual([]);
          expect(seen).toEqual([{ instanceId: I, workflowId: W, outcome: 'started' }]);
          await tick();
          expect(polls(stub)).toBe(1);
        }
      });
    });

    it('starts a workflow with the subject it is given', async () => {
      const stub = stubApi({
        'GET /caller': () => json(200, CALLER),
        'GET /app/objects': () => json(200, appObjects('entity:batch', E)),
        'GET /workflows/startable': () => json(200, startable),
        [`GET /workflow-versions/${V}/start-form`]: () => json(200, startForm),
        [`POST /workflows/${W}/instances`]: () => json(201, { id: I, status: 'running' }),
      });
      const p = await mount(`<agentflow-start-form workflow-id="${W}" subject-entity="batch" subject-record="${R}"></agentflow-start-form>`, stub);
      expect(caseName(p)).toBe('Open a claim');
      type(p, 'f-amount', '250');
      click(p, 'Start');
      await settle();
      expect(stub.calls.at(-1)!.body).toEqual({
        name: 'Open a claim',
        version_id: V,
        input_payload: { amount: 250 },
        subject: { kind: 'record', record_id: R },
      });
    });
  });

  describe('a folder field', () => {
    // Its source is in place, as on a page that has drawn one before; start-form-folder-load.test.ts has the first draw.
    beforeAll(() => defineFolderSource());
    const S = '0190c0de-0000-7000-8000-0000000000s1';
    const files = { type: 'array', title: 'Scans', items: { type: 'string', format: 'attachment' } };
    const form = (required: string[]) => ({
      form_definition: { schema_json: { type: 'object', required, properties: { scans: files, note: { type: 'string', title: 'Note' } } } },
      version_updated_at: '2026-09-25T00:00:00Z',
    });
    const preview = {
      field: 'scans', grain: 'folder', depth: 2, group_count: 12, item_count: 1340, sample_keys: ['HS-481'],
      loose_file_count: 0, excluded_count: 0, excluded_by_reason: {}, refusal: null,
    };
    const api = (required: string[] = [], more: Parameters<typeof stubApi>[0] = {}) =>
      stubApi({
        'GET /caller': () => json(200, CALLER),
        'GET /workflows/startable': () => json(200, startable),
        [`GET /workflow-versions/${V}/start-form`]: () => json(200, form(required)),
        [`GET /workflows/${W}/input-contract`]: () =>
          json(200, {
            published: true, version_id: V, form_definition_id: null, subject: { kind: 'none' },
            params_slots: [{ key: 'scans', required: false, folder: { grain: 'folder', depth: 2 } }, { key: 'note', required: false }],
          }),
        'GET /watched-folders': () => json(200, { items: [{ id: S, name: 'Court scans', source: 'sftp', status: 'open', entry_count: 1234, last_scan_at: null }] }),
        [`POST /workflows/${W}/folder-preview`]: () => json(200, preview),
        [`POST /workflows/${W}/instances`]: () => json(201, { id: I, status: 'running' }),
        ...more,
      });
    const source = (p: HTMLElement) =>
      root(p).querySelector('af-folder-source') as HTMLElement & { folder: unknown; workflow: string; version: string | null; field: string; resumeSet: string | null };
    const chooseWatched = async (p: HTMLElement) => {
      const inner = shadow(source(p));
      (inner.querySelector('[part~="source"] input[value="watched"]') as HTMLInputElement).click();
      await settle();
      (inner.querySelector('[part~="choose"]') as HTMLButtonElement).click();
      await settle();
    };

    it('draws a folder field and starts with the chosen set', async () => {
      const stub = api();
      const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, stub);
      expect(fieldOf(p, 'scans').querySelector('[part="label"]')!.textContent!.trim()).toBe('Scans');
      expect(fieldOf(p, 'scans').textContent).not.toContain("This field can't be edited here.");
      const el = source(p);
      // The kit names its radio group "Source" on every field, so the field's own label names the whole control.
      expect(el.getAttribute('role')).toBe('group');
      expect(root(p).getElementById(el.getAttribute('aria-labelledby')!)).toBe(fieldOf(p, 'scans').querySelector('[part="label"]'));
      expect([el.workflow, el.version, el.field, el.folder]).toEqual([W, null, 'scans', { grain: 'folder', depth: 2 }]);
      await chooseWatched(p);
      // The element checked the launch through the form's own client. It names no version: the form starts the current
      // one, which is what the check reads unasked, and an app's request that names any version is refused.
      expect(stub.calls.find((c) => c.path.endsWith('/folder-preview'))!.body).toEqual({ field: 'scans', file_set_id: S });
      expect(shadow(el).querySelector('[part~="preview"]')).not.toBeNull();
      click(p, 'Start');
      await settle();
      expect(stub.calls.at(-1)!.body).toEqual({ name: 'Open a claim', version_id: V, input_payload: { scans: { $fileSet: S } } });
      // One set feeds one launch, so the form that reset itself holds no source either.
      expect(shadow(source(p)).querySelector('[part~="chosen"]')).toBeNull();
      click(p, 'Start');
      await settle();
      expect(stub.calls.at(-1)!.body).toEqual({ name: 'Open a claim', version_id: V, input_payload: {} });
    });

    it('a required folder field blocks the start until a source is chosen', async () => {
      const stub = api(['scans']);
      const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, stub);
      expect(button(p, 'Start')!.disabled).toBe(false);
      expect(root(p).textContent).not.toContain("This form has a required field that can't be edited here.");
      click(p, 'Start');
      await settle();
      expect(posts(stub).filter((c) => c.path.endsWith('/instances'))).toEqual([]);
      expect(fieldOf(p, 'scans').querySelector('[part="field-error"]')?.textContent).toBe('Required');
      await chooseWatched(p);
      click(p, 'Start');
      await settle();
      expect(stub.calls.at(-1)!.body).toEqual({ name: 'Open a claim', version_id: V, input_payload: { scans: { $fileSet: S } } });
    });

    const pickFolder = async (p: HTMLElement) => {
      const file = new File(['x'], 'p1.pdf');
      Object.defineProperty(file, 'webkitRelativePath', { value: 'batch-12/HS-481/p1.pdf' });
      const input = shadow(source(p)).querySelector('input[type="file"]') as HTMLInputElement;
      Object.defineProperty(input, 'files', { value: [file], configurable: true });
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await settle();
    };
    const started = (stub: { calls: { method: string; path: string }[] }) => posts(stub).filter((c) => c.path.endsWith('/instances'));

    it('starts nothing while a folder field is uploading, and can start again once the upload is cancelled', async () => {
      for (const required of [[], ['scans']]) {
        // The set is still being declared, so the source has announced nothing but that it is busy.
        const stub = api(required, { 'POST /upload-sets': () => new Promise<Response>(() => {}) });
        const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, stub);
        if (required.length) click(p, 'Start');
        await pickFolder(p);
        expect(button(p, 'Start')!.disabled).toBe(true);
        const start = button(p, 'Start')!;
        start.removeAttribute('disabled');
        start.click();
        await settle();
        expect(started(stub)).toEqual([]);
        expect(fieldOf(p, 'scans').querySelector('[part="field-error"]')).toBeNull();
        expect(fieldOf(p, 'scans').querySelector('[part="notice"]')?.textContent).toBe('Wait for the upload to finish.');

        (shadow(source(p)).querySelector('[part~="cancel"]') as HTMLButtonElement).click();
        await settle();
        expect(button(p, 'Start')!.disabled).toBe(false);
        expect(fieldOf(p, 'scans').querySelector('[part="notice"]')).toBeNull();
        click(p, 'Start');
        await settle();
        expect(started(stub)).toHaveLength(required.length ? 0 : 1);
      }
    });

    it('starts nothing while the launch of the chosen folder would be refused', async () => {
      let refusal: unknown = { code: 'ABOVE_MAX_ITEMS', message: 'Too many folders.' };
      const stub = api([], { [`POST /workflows/${W}/folder-preview`]: () => json(200, { ...preview, refusal }) });
      const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, stub);
      await chooseWatched(p);
      expect(button(p, 'Start')!.disabled).toBe(true);
      const start = button(p, 'Start')!;
      start.removeAttribute('disabled');
      start.click();
      await settle();
      expect(started(stub)).toEqual([]);
      // The source says why in its own words, so the form adds none.
      expect(fieldOf(p, 'scans').querySelector('[part="notice"]')).toBeNull();

      // A choice the launch would take lets it go.
      refusal = null;
      await chooseWatched(p);
      expect(button(p, 'Start')!.disabled).toBe(false);
      click(p, 'Start');
      await settle();
      expect(started(stub)).toHaveLength(1);
    });

    it('continues the upload set the page hands back for a field', async () => {
      const stub = api([], {
        [`GET /upload-sets/${S}/files`]: () => json(200, { items: [{ path: 'HS-481/p1.pdf', byte_size: 1, stored: true, refused_reason: null }], next_cursor: null }),
        [`POST /upload-sets/${S}/complete`]: () => json(200, {}),
      });
      const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, stub);
      Object.assign(p.querySelector('agentflow-start-form')!, { resumeSets: { scans: S } });
      await settle();
      await pickFolder(p);
      expect(stub.calls.some((c) => c.method === 'POST' && c.path === '/upload-sets')).toBe(false);
      click(p, 'Start');
      await settle();
      expect(stub.calls.at(-1)!.body).toEqual({ name: 'Open a claim', version_id: V, input_payload: { scans: { $fileSet: S } } });
      // A run took that set, so the form that reset itself does not offer to continue it, whatever the page still holds.
      expect(source(p).resumeSet).toBeNull();
      // Until the page says anew which sets to continue.
      Object.assign(p.querySelector('agentflow-start-form')!, { resumeSets: { scans: S } });
      await settle();
      expect(source(p).resumeSet).toBe(S);
    });

    it('reads no contract for a form with no field of files, and leaves a field the contract gives no folder as it was', async () => {
      const plain = stubApi({
        'GET /caller': () => json(200, CALLER),
        'GET /workflows/startable': () => json(200, startable),
        [`GET /workflow-versions/${V}/start-form`]: () => json(200, startForm),
      });
      await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, plain);
      expect(plain.calls.some((c) => c.path.endsWith('/input-contract'))).toBe(false);

      const bare = stubApi({
        'GET /caller': () => json(200, CALLER),
        'GET /workflows/startable': () => json(200, startable),
        [`GET /workflow-versions/${V}/start-form`]: () => json(200, form(['scans'])),
        [`GET /workflows/${W}/input-contract`]: () =>
          json(200, { published: true, version_id: V, form_definition_id: null, subject: { kind: 'none' }, params_slots: [{ key: 'scans', required: true, folder: null }] }),
      });
      const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, bare);
      expect(root(p).querySelector('af-folder-source')).toBeNull();
      expect(button(p, 'Start')!.disabled).toBe(true);
    });

    describe('when the start binds no form', () => {
      const E = '0190c0de-0000-7000-8000-0000000000e1';
      const R = '0190c0de-0000-7000-8000-0000000000r1';
      const A = '0190c0de-0000-7000-8000-0000000000a1';
      const FOLDER = { key: 'files', title: 'Dossier folders', required: true, folder: { grain: 'folder', depth: 1 } };
      const schemaOnly = (params_slots: unknown[]) => ({ published: true, version_id: V, form_definition_id: null, subject: { kind: 'record' }, params_slots });
      const stub = (routes: Parameters<typeof stubApi>[0]) =>
        stubApi({
          'GET /caller': () => json(200, CALLER),
          'GET /workflows/startable': () => json(200, startable),
          'GET /watched-folders': () => json(200, { items: [{ id: S, name: 'Court scans', source: 'sftp', status: 'open', entry_count: 1234, last_scan_at: null }] }),
          [`POST /workflows/${W}/folder-preview`]: () => json(200, { ...preview, field: 'files' }),
          [`POST /workflows/${W}/instances`]: () => json(201, { id: I, status: 'running' }),
          ...routes,
        });
      const forAction = (params_slots: unknown[]) =>
        stub({
          'GET /app/objects': () => json(200, appObjects('entity:batch', E)),
          [`GET /entities/${E}`]: () =>
            json(200, {
              id: E, key: 'batch', name: 'Batch', fields: [], browser_config: { display_field: 'code', facets: [] },
              actions: [{ id: A, key: 'add_dossiers', label: 'Add dossiers', workflow_id: W, input_map: [{ from: 'record.code', to: 'params.batch_code' }], mode: 'async' }],
            }),
          [`GET /entities/${E}/records/${R}`]: () => json(200, { id: R, entity_id: E, body: { code: 'B-7' } }),
          [`GET /workflows/${W}/input-contract`]: () => json(200, schemaOnly(params_slots)),
        });
      const ACTION = `<agentflow-start-form entity="batch" record="${R}" action="add_dossiers"></agentflow-start-form>`;
      const NAMED = `<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`;
      const named = (params_slots: unknown[]) =>
        stub({
          [`GET /workflow-versions/${V}/start-form`]: () => json(200, NO_FORM),
          [`GET /workflows/${W}/input-contract`]: () => json(200, schemaOnly(params_slots)),
        });

      it('draws a folder field from the contract when the start binds no form', async () => {
        const api = forAction([FOLDER, { key: 'batch_code', required: false }, { key: 'note', required: false }]);
        const p = await mount(ACTION, api);
        expect(fieldOf(p, 'files').querySelector('[part="label"]')!.textContent!.trim()).toBe('Dossier folders*');
        const el = source(p);
        expect([el.workflow, el.version, el.field, el.folder]).toEqual([W, null, 'files', { grain: 'folder', depth: 1 }]);
        // The contract carries no field types, so the workflow's other parameters are not asked for.
        expect(root(p).querySelectorAll('[part="field"]')).toHaveLength(1);
        expect(api.calls.some((c) => c.path.endsWith('/start-form'))).toBe(false);

        click(p, 'Start');
        await settle();
        expect(started(api)).toEqual([]);
        expect(fieldOf(p, 'files').querySelector('[part="field-error"]')?.textContent).toBe('Required');
        await chooseWatched(p);
        click(p, 'Start');
        await settle();
        expect(api.calls.at(-1)!.body).toEqual({
          name: 'Add dossiers · B-7',
          subject: { kind: 'record', record_id: R },
          params: { batch_code: 'B-7', files: { $fileSet: S } },
          version_id: V,
          action_context: { entity_id: E, action_id: A, record_id: R },
        });
      });

      it('draws it for a named workflow as well, under its key when the slot has no title', async () => {
        const api = named([{ key: 'files', required: false, folder: { grain: 'file' } }, { key: 'note', required: true }]);
        const p = await mount(NAMED, api);
        expect(fieldOf(p, 'files').querySelector('[part="label"]')!.textContent!.trim()).toBe('files');
        expect(source(p).folder).toEqual({ grain: 'file' });
        await chooseWatched(p);
        click(p, 'Start');
        await settle();
        expect(api.calls.at(-1)!.body).toEqual({ name: 'Open a claim', version_id: V, input_payload: { files: { $fileSet: S } } });
      });

      it('draws nothing extra for a schema-only start without folder slots', async () => {
        const slots = [{ key: 'files', required: true, folder: null }, { key: 'note', required: false }];
        const action = forAction(slots);
        const a = await mount(ACTION, action);
        expect(root(a).querySelector('af-folder-source')).toBeNull();
        expect(root(a).querySelector('[part="field"]')).toBeNull();
        expect(button(a, 'Start')!.disabled).toBe(false);
        expect(action.calls.some((c) => c.path.endsWith('/start-form'))).toBe(false);

        const plain = named(slots);
        const p = await mount(NAMED, plain);
        expect([...root(p).querySelectorAll('[part="field"] [part="label"]')].map((l) => l.textContent!.trim())).toEqual(['Case name*']);
        expect(plain.calls.filter((c) => c.method === 'GET').map((c) => c.path)).toEqual([
          '/caller', '/workflows/startable', `/workflow-versions/${V}/start-form`, `/workflows/${W}/input-contract`,
        ]);
      });
    });

    it('tells the page of an upload set as soon as it exists, and which field it is for', async () => {
      const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, api());
      const seen = listen(document.body, 'af-folder-upload-started');
      source(p).dispatchEvent(new CustomEvent('af-folder-upload-started', { detail: { setId: S }, bubbles: true }));
      expect(seen).toEqual([{ setId: S, field: 'scans' }]);
    });
  });

  it("start-form with workflow-key opens that workflow's form", async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /app/objects': () => json(200, appObjects('workflow:intake', W)),
      'GET /workflows/startable': () => json(200, startable),
      [`GET /workflow-versions/${V}/start-form`]: () => json(200, startForm),
    });
    const p = await mount('<agentflow-start-form workflow-key="intake"></agentflow-start-form>', api);
    expect((root(p).querySelector('#f-__name') as HTMLInputElement).value).toBe('Open a claim');
    expect(root(p).querySelector('[part="picker"]')).toBeNull();
  });

  it('a workflow-key the app does not have shows not installed', async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /app/objects': () => json(200, appObjects('workflow:intake', null, 'off')),
      'GET /workflows/startable': () => json(200, startable),
    });
    const p = await mount('<agentflow-start-form workflow-key="intake"></agentflow-start-form>', api);
    expect(root(p).textContent).toContain('This app has no workflow:intake.');
    expect(root(p).querySelector('[part="picker"]')).toBeNull();
    expect(api.calls.some((c) => c.path === '/workflows/startable')).toBe(false);
  });

  it('a workflow-key whose lookup fails shows the error, not not installed, and reports it', async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      'GET /app/objects': () => problem(500, 'INTERNAL'),
      'GET /workflows/startable': () => json(200, startable),
    });
    const failed: unknown[] = [];
    const hear = (e: Event) => failed.push((e as CustomEvent).detail);
    document.body.addEventListener('request-failed', hear);
    const p = await mount('<agentflow-start-form workflow-key="intake"></agentflow-start-form>', api);
    document.body.removeEventListener('request-failed', hear);
    const shown = root(p).querySelector('[part="error"]')?.textContent ?? '';
    expect(shown).toContain('Something went wrong (INTERNAL).');
    expect(shown).not.toContain('This app has no');
    expect(failed).toEqual([expect.objectContaining({ code: 'INTERNAL', status: 500 })]);
  });
});
