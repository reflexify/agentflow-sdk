import { ok } from '@reflexify/agentflow-sdk';
import { as, completeTask, idsByKey, waitForTask } from '@reflexify/agentflow-sdk/testing';
import { expect, it } from 'vitest';
import type { LogicalKey } from '../src/generated/app';

const ids = idsByKey<LogicalKey>();
const entity_id = ids['entity:leave_request'];
const emma = as('emma');
const alan = as('alan');

async function readAs(client: typeof emma, record_id: string) {
  return ok(client.GET('/entities/{entity_id}/records/{record_id}', { params: { path: { entity_id, record_id } } }));
}

it('refuses a request whose last day is before its first', async () => {
  const refused = await emma.POST('/entities/{entity_id}/records', {
    params: { path: { entity_id } },
    body: { form_payload: { leave_type: 'annual', from_date: '2026-12-10', to_date: '2026-12-08', reason: 'e2e order' } },
  });
  expect(refused.response.status).toBe(422);
});

it('submits a request, and an approver approves it', async () => {
  const created = await ok(emma.POST('/entities/{entity_id}/records', {
    params: { path: { entity_id } },
    body: { form_payload: { leave_type: 'annual', from_date: '2026-12-21', to_date: '2026-12-23', reason: 'e2e approve' } },
  }));
  expect(created.body).toMatchObject({ status: 'draft', days: 3 });

  await ok(emma.PATCH('/entities/{entity_id}/records/{record_id}', {
    params: { path: { entity_id, record_id: created.id } },
    body: { changes: { status: 'submitted' }, expected_updated_at: created.updated_at },
  }));

  const task = await waitForTask(alan, 'decide', created.id);
  const seen = await readAs(alan, created.id);
  await ok(alan.PATCH('/entities/{entity_id}/records/{record_id}', {
    params: { path: { entity_id, record_id: created.id } },
    body: { changes: { decision_note: 'Enjoy the holiday' }, expected_updated_at: seen.updated_at },
  }));
  await completeTask(alan, task, 'approve');

  await expect.poll(async () => (await readAs(emma, created.id)).body.status, { timeout: 60_000, interval: 1000 }).toBe('approved');
  const approved = (await readAs(emma, created.id)).body;
  expect(approved.decision_note).toBe('Enjoy the holiday');

  const [attachment_id] = approved.approval_letter as string[];
  const letter = await ok(emma.GET('/attachments/{attachment_id}', { params: { path: { attachment_id } } }));
  expect(letter).toMatchObject({ content_type: 'application/pdf', original_filename: `approval-${approved.number}.pdf` });
  const pdf = await emma.GET('/attachments/{attachment_id}/download', { params: { path: { attachment_id } }, parseAs: 'arrayBuffer' });
  expect(Buffer.from(pdf.data as ArrayBuffer).subarray(0, 5).toString()).toBe('%PDF-');
});

it('lets only an approver approve by hand', async () => {
  const created = await ok(emma.POST('/entities/{entity_id}/records', {
    params: { path: { entity_id } },
    body: { form_payload: { leave_type: 'sick', from_date: '2026-11-02', to_date: '2026-11-02', reason: 'e2e self-approve' } },
  }));
  const submitted = await ok(emma.PATCH('/entities/{entity_id}/records/{record_id}', {
    params: { path: { entity_id, record_id: created.id } },
    body: { changes: { status: 'submitted' }, expected_updated_at: created.updated_at },
  }));
  const refused = await emma.PATCH('/entities/{entity_id}/records/{record_id}', {
    params: { path: { entity_id, record_id: created.id } },
    body: { changes: { status: 'approved' }, expected_updated_at: submitted.updated_at },
  });
  expect(refused.response.status).toBe(422);
  const noted = await emma.PATCH('/entities/{entity_id}/records/{record_id}', {
    params: { path: { entity_id, record_id: created.id } },
    body: { changes: { decision_note: 'I approve myself' }, expected_updated_at: submitted.updated_at },
  });
  expect(noted.response.status).toBe(422);

  const task = await waitForTask(alan, 'decide', created.id);
  await completeTask(alan, task, 'reject');
  await expect.poll(async () => (await readAs(emma, created.id)).body.status, { timeout: 60_000, interval: 1000 }).toBe('rejected');
});


it('refuses unpaid leave without a reason', async () => {
  const refused = await emma.POST('/entities/{entity_id}/records', {
    params: { path: { entity_id } },
    body: { form_payload: { leave_type: 'unpaid', from_date: '2027-01-04', to_date: '2027-01-05' } },
  });
  expect(refused.response.status).toBe(422);
});
