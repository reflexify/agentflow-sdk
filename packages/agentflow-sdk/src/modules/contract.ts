import type { AgentFlowClient } from '../client.js';
import type { components } from '../generated/public.js';
import type { RealtimeChannel } from '../realtime/channel.js';

/**
 * The contract version this SDK's hosts implement. A module may declare 1 to 5: 1 lacks `assistant`, 1 and 2
 * lack `signing`, 1 to 3 lack the item list, `kinds` and `open`, and 1 to 4 lack `tasks`.
 */
export const APP_CONTRACT_VERSION = 5;

/** What a host takes of the assistant's items; over any of these the question is refused. */
export const APP_ASSISTANT_ITEMS_MAX = 5;
export const APP_ASSISTANT_RECORDS_MAX = 50;
/** UTF-8 bytes of `JSON.stringify(text)`, quotes included. */
export const APP_ASSISTANT_TEXT_MAX_BYTES = 12288;
/** UTF-8 bytes of `JSON.stringify(data)`. */
export const APP_ASSISTANT_DATA_MAX_BYTES = 4096;
/** Characters. */
export const APP_ASSISTANT_LABEL_MAX = 80;
/** Characters. */
export const APP_ASSISTANT_PROMPT_MAX = 2000;

export interface AppTheme {
  mode: 'light' | 'dark';
  /** The palette: `azure`, `violet` or `crimson` inside AgentFlow; the app's own name standalone. */
  brand: string;
}

/** The record a person is looking at inside the module. */
export interface AppAssistantContext {
  /** The entity's key in the package (`item` of `entity:item`), not the key it was installed under, nor its id. */
  entity: string;
  /** The record's id. */
  record: string;
}

export type AppJson = null | boolean | number | string | readonly AppJson[] | { readonly [key: string]: AppJson };

/** Records by a filter, as the records search takes it. */
export type AppRecordFilter = Pick<components['schemas']['EntityRecordFilters'], 'field_filters' | 'ref_filters'>;

export type AppAssistantItem =
  | { kind: 'record'; entity: string; record: string }
  | { kind: 'records'; entity: string; records: readonly string[] }
  | { kind: 'view'; entity: string; filter: AppRecordFilter; label: string }
  | { kind: 'file'; file: string }
  | { kind: 'dashboard'; dashboard: string }
  | { kind: 'text'; text: string; label: string; from?: AppAssistantContext }
  | AppAssistantAppItem;

/** An app kind: `<package>:<name>`, declared in the package's `assistant.context_kinds`. */
export interface AppAssistantAppItem {
  kind: `${string}:${string}`;
  label: string;
  data: AppJson;
}

export interface AppAssistantOpenOptions {
  /** A question put in the composer for the person to send or change. It is never sent by itself. */
  prompt?: string;
  /** Items attached as the dock opens, after the screen's context. */
  attach?: readonly AppAssistantItem[];
}

export interface AppAssistant {
  /** The platform kinds this host takes. Absent on a host before contract 4, which takes one `{ entity, record }`. */
  readonly kinds?: readonly string[];
  /** What the person is looking at, most relevant first. Replaces the last call's; `null` or `[]` clears. */
  setContext(context: AppAssistantContext | readonly AppAssistantItem[] | null): void;
  /** Opens the docked assistant, as pressing its button would. Only a person's click or key press opens it. Absent before contract 4. */
  open?(options?: AppAssistantOpenOptions): void;
}

/** The record to sign. */
export interface AppSignTarget {
  /**
   * The entity: a key in the package, an installed key, or an entity id; or the Workflow task entity's id,
   * with the task record.
   */
  entity: string;
  /** The record's id. */
  record: string;
}

/**
 * How signing ended, as AgentFlow's backend reports it. The backend acts only on e-sign events that end the
 * whole envelope, and a signer's signature is recorded once every signer has completed.
 *
 * - `signed`: the step's signature is recorded. On a Signature step with several signers, that is when the
 *   last of them signs. Until then, a person who signed and closed the dialog gets `closed`.
 * - `declined`: the envelope was declined before this person's signature was recorded, by this person or by
 *   another signer.
 * - `closed`: the dialog closed with no end yet, or the step ended without a signature or a decline (an
 *   expired envelope, for one). Read the record again later, or use `host.realtime`.
 * - `nothing_to_sign`: no open signing task of this app was found for the target.
 *
 * The workflow moves on after `signed` or `declined` through its own job, so a record read made at once may
 * still show the old state.
 */
export type SignOutcome = 'signed' | 'declined' | 'closed' | 'nothing_to_sign';

export interface AppSigning {
  /** Opens AgentFlow's signing dialog for the record, and resolves when it ends. */
  sign(target: AppSignTarget): Promise<SignOutcome>;
}

/** `error`: the handle has not managed to read the task yet; `problem` says why, and it keeps trying. */
export type AppTaskStatus = 'loading' | 'ready' | 'not_found' | 'finished' | 'error';

export type AppTaskReason =
  | 'claim_first'
  | 'held_by_other'
  | 'finished'
  | 'signed_waiting'
  | 'content_not_shown'
  | 'values_invalid'
  | 'selection_out_of_bounds'
  | 'busy';

export interface AppTaskAction {
  id: string;
  label: string;
  tone: string | null;
  icon: string | null;
  kind: 'submit' | 'sign';
  enabled: boolean;
  /** Null exactly when `enabled`. */
  reason: AppTaskReason | null;
  /** Set with `values_invalid`: the fields that fail validation. */
  fields?: string[];
}

export interface AppTaskWork {
  holder: { id: string; name: string | null } | null;
  canClaim: boolean;
  canRelease: boolean;
  dueAt: string | null;
  clocks: AppJson;
}

export type AppTaskEventKind = 'submitted' | 'claimed' | 'released' | 'signed' | 'declined' | 'changed';

export interface AppTaskState {
  status: AppTaskStatus;
  record: { entity: string; id: string } | null;
  step: components['schemas']['RecordStep'] | null;
  work: AppTaskWork | null;
  values: Record<string, unknown>;
  actions: AppTaskAction[];
  allHidden: boolean;
  canSaveDraft: boolean;
  busy: boolean;
  taken: { id: string; label: string; by: 'person' | 'deadline' } | null;
  lastEvent: { kind: AppTaskEventKind; actionId?: string; seq: number } | null;
  /** Why the task could not be read; set exactly when `status` is `error`. */
  problem: AppTaskProblem | null;
}

/**
 * Why a task call failed. `status: 0` means the host refused before sending, with `type` the reason
 * (`busy`, `claim_first`, `held_by_other`, `finished`, `signed_waiting`, `content_not_shown`,
 * `values_invalid`, `selection_out_of_bounds`, `unknown_action`, `sign_action`, `draft_not_allowed`,
 * `not_ready`, `not_found`), or the request could not
 * be sent (`NETWORK_ERROR`). Otherwise `status` and `type` are the server's, for example 409
 * `WORK_NOT_ACTIVE`; a read the server refused without a problem body is `READ_FAILED`.
 */
export interface AppTaskProblem {
  status: number;
  type: string;
  title: string;
  detail?: string;
}

export interface AppTaskError extends Error {
  problem: AppTaskProblem;
}

export interface AppTaskHandle {
  readonly state: AppTaskState;
  subscribe(listener: (state: AppTaskState) => void): () => void;
  /** The embedded selection rides as `{ selection: ids }`. */
  setValues(changes: Record<string, unknown>): void;
  saveDraft(): Promise<void>;
  submit(actionId: string): Promise<void>;
  claim(): Promise<void>;
  release(): Promise<void>;
  sign(): Promise<SignOutcome>;
  previewDocument(viewId: string): Promise<Blob>;
  embeddedRecords(options?: { cursor?: string }): Promise<AppJson>;
  diagram(): Promise<AppJson>;
  fieldOrigins(): Promise<AppJson>;
  comments: {
    list(options?: { cursor?: string }): Promise<AppJson>;
    add(body: string): Promise<AppJson>;
  };
  close(): void;
}

export interface AppTasks {
  open(target: { record: string; entity?: string }): AppTaskHandle;
}

export interface AppContext {
  person: { id: string; name: string; email: string | null };
  org: { id: string; name: string | null };
  /** A BCP 47 tag: `vi` or `en` inside AgentFlow. It changes in place; `onLocaleChange` says when. */
  locale: string;
  /** The current theme. It changes in place; `onThemeChange` says when. */
  theme: AppTheme;
}

/**
 * What a host gives a module: plain data and functions, nothing of the host's own framework. A host
 * may be a plain object or a class instance.
 *
 * A path is everything after `basePath` in the address bar, pathname, query and fragment
 * (`/t/42?tab=notes#n3`), and always starts with `/`.
 */
/** How `navigate` moves. */
export interface AppNavigateOptions {
  /** Take the place of the current history entry instead of adding one. */
  replace?: boolean;
}

export interface AppHost {
  contractVersion: typeof APP_CONTRACT_VERSION;
  /**
   * The SDK's typed client, as the signed-in person. In every host, `GET /app/objects` answers for the
   * module's own app: how a module turns the keys it ships with into this organization's ids.
   */
  api: AgentFlowClient;
  /**
   * An absolute URL for a published operation's `path` (`/attachments/a1/download`, query kept), under
   * the API `api` calls, that the browser can open with the person's credentials: a download link, an
   * image.
   */
  apiUrl(path: string): string;
  /** Where the module lives in the address bar: `/apps/<key>` inside AgentFlow, `/` standalone. */
  basePath: string;
  /**
   * Go to `path` inside the module (`/`, `/t/42?tab=notes#n3`); the host owns the address bar. With
   * `replace`, the move takes the place of the current history entry, so Back skips a page that only
   * redirects. A host older than the option ignores it and adds an entry.
   */
  navigate(path: string, options?: AppNavigateOptions): void;
  /**
   * Called at once with the module's current path, then once for each change: `navigate`, back and
   * forward, and a fragment change.
   */
  onLocationChange(listener: (path: string) => void): () => void;
  /**
   * A real-time channel for the module, opened the first time it is read. Every read hands out the same
   * channel, and the host closes it when the module unmounts: a module never calls `close()` on it.
   */
  readonly realtime: RealtimeChannel;
  context: AppContext;
  /** Called whenever `context.theme` changes; not when it subscribes. */
  onThemeChange(listener: (theme: AppTheme) => void): () => void;
  /** Called whenever `context.locale` changes; not when it subscribes. */
  onLocaleChange(listener: (locale: string) => void): () => void;
  /** Where dialogs and popovers go: inside the module's shadow root, so the tokens reach them. */
  portalRoot: Element;
  /** The docked assistant, when this host has one for the person; absent otherwise (standalone, or no assistant). */
  readonly assistant?: AppAssistant;
  /** Signing, when this host offers it: AgentFlow's host offers it, and the standalone host leaves it out. */
  readonly signing?: AppSigning;
  /** Task pages, when this host offers them; absent before contract 5. */
  readonly tasks?: AppTasks;
}

/** An app's UI module: the entry file's named export `mount`. */
export interface AppModule {
  /** Render into `root` (inside a shadow root: `root.getRootNode()`), and return how to stop. */
  mount(root: ShadowRoot | Element, host: AppHost): () => void;
}

/**
 * The module's own path for an address-bar `href` (`pathname + search + hash`) under `basePath`. It
 * always starts with `/` and keeps the query and fragment; a pathname outside `basePath` gives `/`.
 */
export function modulePath(href: string, basePath: string): string {
  const cut = href.search(/[?#]/);
  const pathname = cut === -1 ? href : href.slice(0, cut);
  const rest = cut === -1 ? '' : href.slice(cut);
  const base = basePath.replace(/\/+$/, '');
  if (!base) return `${pathname || '/'}${rest}`;
  if (pathname === base || pathname === `${base}/`) return `/${rest}`;
  return pathname.startsWith(`${base}/`) ? `${pathname.slice(base.length)}${rest}` : '/';
}

/** The address-bar `href` for the module's own `path` under `basePath`, query and fragment kept. */
export function hostPath(basePath: string, path: string): string {
  const base = basePath.replace(/\/+$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
