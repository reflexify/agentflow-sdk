import type { WorkflowKey } from '../../shared/contract.js';
import type {
  AutopilotRule, CannedReply, Contact, FileRef, Note, Person, Priority, Reply, Ticket, TicketStatus,
} from '../model/types.js';

export type HandlingAction = 'solved' | 'waiting' | 'escalate';
export type AutopilotMode = 'off' | 'shadow' | 'live';

export interface Me { id: string; displayName: string; email: string | null; permissions: string[]; orgName: string | null }

/** One live "Handle ticket" task of the Handling workflow: a Workflow task record in the person's My Work. */
export interface QueueTask {
  /** The Workflow task's record. */
  id: string;
  /** The Workflow task entity, which every write about the task names. */
  entityId: string;
  ticketId: string;
  /** `handle_urgent` … `handle_low`. */
  nodeId: string;
  status: 'open' | 'claimed';
  claimedByUserId: string | null;
  dueAt: string | null;
  createdAt: string;
}
/** What a write about a task names: its record and its entity. */
export type TaskRef = Pick<QueueTask, 'id' | 'entityId'>;

export type RunResult =
  | { state: 'running'; runId: string }
  | {
      state: 'done';
      runId: string;
      status: 'completed' | 'failed' | 'cancelled';
      /** The End step's values. */
      output: Record<string, unknown>;
      /**
       * The End step's outcome label, which tells the endings of one workflow apart:
       * Accept "Accepted" or "Already decided"; Move "Moved" or "Already decided";
       * Draft reply "Drafted", "Sent by autopilot" or "Not saved".
       */
      outcome: string | null;
      error: string | null;
    };

export interface TicketFilter { status: TicketStatus[]; requesterId?: string }
export interface Page<T> { items: T[]; nextCursor: string | null }
export interface NewDraft { ticketId: string; body: string; authorUserId: string }
export interface DraftChanges { body?: string; attachments?: string[]; cc?: string | null }
export interface NewNote { ticketId: string; kind: 'staff' | 'event'; body: string; authorUserId: string; mentions?: string[] }
export interface NewContact { email: string; name?: string; organization?: string; locale?: string; notes?: string }
export type ContactChanges = Partial<Pick<Contact, 'name' | 'organization' | 'locale' | 'notes'>>;

/** The desk's one door to AgentFlow. Every method is one or two published operations. */
export interface DeskApi {
  me(): Promise<Me>;
  /** Active members of the support group, for hand-over and @mentions. */
  people(): Promise<Person[]>;

  handlingTasks(): Promise<QueueTask[]>;
  claim(task: TaskRef): Promise<void>;
  release(task: TaskRef): Promise<void>;
  handOver(task: TaskRef, userId: string): Promise<void>;
  /** Resolves with the Handling run the task belongs to, as the panel the submit answers names it. */
  submit(task: TaskRef, action: HandlingAction, byUserId: string): Promise<string>;

  ticket(id: string): Promise<Ticket>;
  tickets(filter: TicketFilter, limit?: number): Promise<Ticket[]>;
  countTickets(filter: TicketFilter): Promise<number>;
  updateTicket(ticket: Ticket, changes: { priority?: Priority; requester?: string }): Promise<Ticket>;

  thread(ticketId: string): Promise<{ replies: Reply[]; notes: Note[] }>;
  drafts(): Promise<Reply[]>;
  heldMessages(): Promise<Reply[]>;
  reply(id: string): Promise<Reply>;
  /** Fails with `conflict` when the ticket already has a draft (its `draft:` key is taken). */
  createDraft(input: NewDraft): Promise<Reply>;
  /** Fails with `stale` when someone saved the draft after `draft` was read. */
  saveDraft(draft: Reply, changes: DraftChanges, authorUserId: string): Promise<Reply>;

  createNote(input: NewNote): Promise<Note>;
  mentions(userId: string): Promise<Note[]>;

  contact(id: string): Promise<Contact>;
  contacts(q: string, cursor?: string | null): Promise<Page<Contact>>;
  countContacts(): Promise<number>;
  createContact(input: NewContact): Promise<Contact>;
  updateContact(contact: Contact, changes: ContactChanges): Promise<Contact>;

  cannedReplies(): Promise<CannedReply[]>;
  autopilotRules(): Promise<AutopilotRule[]>;
  setAutopilotMode(intent: string, mode: AutopilotMode, existing: AutopilotRule | null): Promise<AutopilotRule>;
  /** Replies with an AI draft behind them since `since`, newest first, at most 2,000. */
  aiReplies(since: string): Promise<{ replies: Reply[]; capped: boolean }>;

  /**
   * Starts a workflow on a record. Send reply's claim and Move's apply run as atomic children that
   * only a worker runs, and Accept and Move also wait for a Draft reply child, so the answer is
   * `running` almost every time, whatever `waitMs` says. Follow it with `waitForRun`.
   */
  start(workflow: WorkflowKey, subjectId: string, params: Record<string, unknown>, waitMs: number | null): Promise<RunResult>;
  run(runId: string): Promise<RunResult>;
  /**
   * Reads the run until it leaves `running` or `timeoutMs` has passed, then returns the last answer.
   * A failed read throws; the wait does not hide it. When `signal` aborts, the wait stops at once
   * (also mid-read), leaves no timer behind, and rejects with an `AbortError` `DOMException`, which
   * is not a `DeskError`.
   */
  waitForRun(runId: string, opts: { timeoutMs: number; intervalMs?: number; signal?: AbortSignal }): Promise<RunResult>;

  upload(file: File): Promise<FileRef>;
  downloadUrl(attachmentId: string): string;
}

export type DeskErrorKind = 'signed_out' | 'forbidden' | 'not_found' | 'stale' | 'conflict' | 'invalid' | 'failed' | 'offline';

/** What went wrong, in the desk's terms. Screens switch on `kind`, never on a status code. */
export class DeskError extends Error {
  constructor(
    readonly kind: DeskErrorKind,
    readonly status: number,
    readonly code: string,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'DeskError';
  }
}

export const isDeskError = (e: unknown, kind?: DeskErrorKind): e is DeskError =>
  e instanceof DeskError && (kind === undefined || e.kind === kind);
