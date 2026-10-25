import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { OBJECTS, type EntityFields } from '../src/generated/app';

const object = (path: string) => JSON.parse(readFileSync(new URL(`../package/objects/${path}`, import.meta.url), 'utf8'));

it('counts both the first and the last day', () => {
  const days = object('entity_field/leave_request__days.json');
  expect(days.type).toBe('formula');
  expect(days.formula_result_type).toBe('number');
  expect(days.formula_expression).toBe('date_diff(from_date, to_date, "days") + 1');
});

it('refuses dates out of order, and lets only approvers and the automation approve', () => {
  const entity = object('entity/leave_request.json');
  expect(entity.rules.map((rule: { key: string }) => rule.key)).toContain('dates_in_order');
  const approve = entity.stage_model.transitions.find((t: { to: string }) => t.to === 'approved');
  expect(approve.movers).toEqual([
    { kind: 'in_group', group_id: '@param:automation_group' },
    { kind: 'in_group', group_id: '@param:approvers' },
  ]);
});

it('ships the workflow, its trigger and the dashboard', () => {
  expect(Object.keys(OBJECTS)).toEqual(expect.arrayContaining(['workflow:approve_leave', 'trigger:on_submit', 'dashboard:leave_overview', 'document_template:approval_letter']));
  const status: EntityFields['leave_request']['status'] = 'submitted';
  expect(status).toBe('submitted');
});
