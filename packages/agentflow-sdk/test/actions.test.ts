import { describe, expect, it } from 'vitest';
import { manualParamKeys, resolveRowInputMap } from '../src/index.js';
import type { components } from '../src/index.js';

type Schemas = components['schemas'];

const RECORD_ID = '0b0e6a2c-1f0b-4c57-9a55-0d2f4f1f8a01';

function action(input_map?: Schemas['InputBinding'][]): Schemas['RecordAction'] {
  return { id: 'act-1', key: 'approve', label: 'Approve', workflow_id: 'wf-1', input_map };
}

function record(body: Record<string, unknown>): Schemas['EntityRecord'] {
  return { id: RECORD_ID, body } as Schemas['EntityRecord'];
}

function slot(key: string): Schemas['ParamSlot'] {
  return { key, is_entity_ref: false, has_default: false, ref_entity_key: null, required: false, title: key };
}

function contract(form_definition_id?: string | null): Schemas['WorkflowContractSummary'] {
  return {
    subject: { kind: 'entity', entity_id: 'ent-1', multiple: false },
    params_slots: ['bound', 'manual', 'defaulted'].map(slot),
    published: true,
    ...(form_definition_id === undefined ? {} : { form_definition_id }),
  };
}

describe('resolveRowInputMap', () => {
  it("resolves an action's input map over a record", () => {
    const resolved = resolveRowInputMap(
      action([
        { from: 'record.id', to: 'subject' },
        { from: 'record.id', to: 'params.ticket' },
        { from: 'record.amount', to: 'params.amount' },
        { from: 'record.cleared', to: 'params.cleared' },
        { from: 'record.missing', to: 'params.missing' },
        { from: 'default', to: 'params.note' },
        { from: 'selection', to: 'params.picked' },
        { from: 'record.amount', to: 'vars.amount' },
      ]),
      record({ amount: 120, cleared: null })
    );
    expect(resolved).toEqual({
      subject: { kind: 'record', record_id: RECORD_ID },
      // A stored null is a value; a field the record does not hold is skipped.
      params: { ticket: RECORD_ID, amount: 120, cleared: null },
      contextKeys: ['ticket', 'amount', 'cleared'],
      defaultKeys: ['note'],
    });
  });

  it('falls back to the record as the subject when the action has no input map', () => {
    expect(resolveRowInputMap(action(), record({ amount: 1 }))).toEqual({
      subject: { kind: 'record', record_id: RECORD_ID },
      params: {},
      contextKeys: [],
      defaultKeys: [],
    });
  });
});

// A context-bound param is a prefilled default the launcher may edit, so it has to be prompted
// for, but only a form can render one. A raw-schema contract exposes param slots with no
// `form_definition_id`, so there a bound value stays silent and fixed.
describe('manualParamKeys', () => {
  it.each([
    ['prompts for a context-bound slot on a form-backed contract', 'form-1', ['bound'], ['defaulted'], ['bound', 'manual']],
    ['keeps a context-bound slot silent on a raw-schema contract', null, ['bound'], ['defaulted'], ['manual']],
    ['reads a missing form_definition_id as a null one', undefined, ['bound'], undefined, ['manual', 'defaulted']],
    ['never prompts for a default-sourced slot on a form-backed contract', 'form-1', [], ['defaulted'], ['bound', 'manual']],
    ['never prompts for a default-sourced slot on a raw-schema contract', null, [], ['defaulted'], ['bound', 'manual']],
  ] as const)('%s', (_name, form, contextKeys, defaultKeys, expected) => {
    const keys = defaultKeys
      ? manualParamKeys(contract(form), [...contextKeys], [...defaultKeys])
      : manualParamKeys(contract(form), [...contextKeys]);
    expect(keys).toEqual(expected);
  });
});
