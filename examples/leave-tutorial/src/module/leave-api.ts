export type LeaveStatus = 'draft' | 'submitted' | 'approved' | 'rejected';
export type LeaveType = 'annual' | 'sick' | 'unpaid';

export interface LeaveRequest {
  id: string;
  number: string;
  type: LeaveType;
  /** A day, `yyyy-mm-dd`. */
  from: string;
  to: string;
  days: number | null;
  status: LeaveStatus;
}

export interface NewRequest {
  type: LeaveType;
  from: string;
  to: string;
  reason: string;
}

/** What the screen needs from AgentFlow. The module talks to AgentFlow through it, and the demo and the tests through a fake. */
export interface LeaveApi {
  /** The requests the person may see, newest first. */
  list(): Promise<LeaveRequest[]>;
  /** Creates the request and sends it for approval. */
  send(input: NewRequest): Promise<LeaveRequest>;
}

/** A refused or failed call. `reason` is AgentFlow's own sentence when it gave one, shown to the person as it is. */
export class LeaveError extends Error {
  override name = 'LeaveError';
  constructor(readonly code: string, readonly reason: string | null) {
    super(reason ? `${code}: ${reason}` : code);
  }
}
