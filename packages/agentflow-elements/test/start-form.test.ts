import { AgentFlowError } from '@reflexify/agentflow-sdk';
import { describe, expect, it } from 'vitest';
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
const posts = (api: { calls: { method: string }[] }) => api.calls.filter((c) => c.method === 'POST');
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
