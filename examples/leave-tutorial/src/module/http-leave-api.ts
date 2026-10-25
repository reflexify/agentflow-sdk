import { AgentFlowError, getAppObjects, ok, type AppHost, type components } from '@reflexify/agentflow-sdk';
import type { EntityFields, LogicalKey } from '../generated/app.js';
import { LeaveError, type LeaveApi, type LeaveRequest, type LeaveStatus, type LeaveType } from './leave-api.js';

type WireRecord = components['schemas']['EntityRecord'];

const STATUSES: readonly LeaveStatus[] = ['draft', 'submitted', 'approved', 'rejected'];
const TYPES: readonly LeaveType[] = ['annual', 'sick', 'unpaid'];

function toRequest(record: WireRecord): LeaveRequest {
  const body = record.body as EntityFields['leave_request'];
  return {
    id: record.id,
    number: body.number ?? '',
    type: TYPES.includes(body.leave_type as LeaveType) ? (body.leave_type as LeaveType) : 'annual',
    from: body.from_date?.slice(0, 10) ?? '',
    to: body.to_date?.slice(0, 10) ?? '',
    days: body.days ?? null,
    status: STATUSES.includes(body.status as LeaveStatus) ? (body.status as LeaveStatus) : 'draft',
  };
}

function toLeaveError(error: unknown): LeaveError {
  if (error instanceof LeaveError) return error;
  if (!(error instanceof AgentFlowError)) return new LeaveError('NETWORK', null);
  // A field's own message is the most precise; a refusal's detail starts with its code, which people do not read.
  const field = (error.fieldErrors?.[0] as { message?: unknown } | undefined)?.message;
  const said = typeof field === 'string' ? field : error.detail ?? null;
  return new LeaveError(error.code, said ? said.replace(/^[A-Z][A-Z0-9_]+:\s*/, '') : null);
}

async function call<T>(request: Promise<{ data?: T; error?: unknown; response: Response }>): Promise<T> {
  try {
    return await ok(request);
  } catch (error) {
    throw toLeaveError(error);
  }
}

/** The leave request entity's id in this organization, from the keys the package ships with. A module never hard-codes one. */
async function entityId(host: Pick<AppHost, 'api'>): Promise<string> {
  const objects = getAppObjects<LogicalKey>(host.api);
  // A failed load is not kept, so the next call asks again and Try again can recover.
  await objects.load().catch((error: unknown) => {
    throw toLeaveError(error);
  });
  const id = objects.id('entity:leave_request');
  if (!id) throw new LeaveError('NOT_INSTALLED', null);
  return id;
}

/** The leave requests over AgentFlow's published record operations, through the host's client. */
export function createHttpLeaveApi(host: Pick<AppHost, 'api'>): LeaveApi {
  return {
    async list() {
      const entity_id = await entityId(host);
      const page = (cursor: string | null) => call(host.api.POST('/entities/{entity_id}/records/query', {
        params: { path: { entity_id } },
        body: { sort: 'created_at', dir: 'desc', limit: 200, cursor },
      }));
      // A page holds at most 200; the cursor says whether more follow.
      const requests: LeaveRequest[] = [];
      let cursor: string | null = null;
      do {
        const next = await page(cursor);
        requests.push(...next.items.map(toRequest));
        cursor = next.next_cursor ?? null;
      } while (cursor);
      return requests;
    },
    async send(input) {
      const entity_id = await entityId(host);
      // Only the create form's fields: AgentFlow keeps the keys the form binds and drops the rest.
      const created = await call(host.api.POST('/entities/{entity_id}/records', {
        params: { path: { entity_id } },
        body: { form_payload: { leave_type: input.type, from_date: input.from, to_date: input.to, reason: input.reason || null } },
      }));
      // Moving the status to submitted is what starts the approval workflow.
      const sent = await call(host.api.PATCH('/entities/{entity_id}/records/{record_id}', {
        params: { path: { entity_id, record_id: created.id } },
        body: { changes: { status: 'submitted' }, expected_updated_at: created.updated_at },
      }));
      return toRequest(sent);
    },
  };
}
