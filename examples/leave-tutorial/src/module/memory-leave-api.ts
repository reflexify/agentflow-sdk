import { LeaveError, type LeaveApi, type LeaveRequest, type NewRequest } from './leave-api.js';

export interface MemoryLeaveApi extends LeaveApi {
  /** What it holds now, newest first. */
  readonly requests: readonly LeaveRequest[];
  /** The next send fails with this reason, once. */
  failNextSend(reason: string): void;
}

const dayNumber = (day: string) => Date.parse(`${day}T00:00:00Z`) / 86_400_000;

/** The requests kept in memory, for the demo and the tests. `delayMs` makes each call take that long, so loading shows. */
export function createMemoryLeaveApi(seed: LeaveRequest[] = [], opts: { delayMs?: number } = {}): MemoryLeaveApi {
  let requests = [...seed];
  let failure: string | null = null;
  let next = 1;
  const wait = () => new Promise((resolve) => setTimeout(resolve, opts.delayMs ?? 0));

  return {
    get requests() {
      return requests;
    },
    failNextSend(reason) {
      failure = reason;
    },
    async list() {
      await wait();
      return [...requests];
    },
    async send(input: NewRequest) {
      await wait();
      if (failure !== null) {
        const reason = failure;
        failure = null;
        throw new LeaveError('ENTITY_VALIDATION_RULE_FAILED', reason);
      }
      const made: LeaveRequest = {
        id: `memory-${next}`, number: `LV-DEMO-${String(next++).padStart(4, '0')}`, type: input.type, from: input.from, to: input.to,
        days: dayNumber(input.to) - dayNumber(input.from) + 1, status: 'submitted',
      };
      requests = [made, ...requests];
      return made;
    },
  };
}
