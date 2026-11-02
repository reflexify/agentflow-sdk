import type { AgentFlowClient } from '../client.js';
import type { RealtimeChannel } from '../realtime/channel.js';

/**
 * The contract version this SDK's hosts implement. A module may declare 1, 2 or 3: 1 lacks `assistant`,
 * and 1 and 2 lack `signing`.
 */
export const APP_CONTRACT_VERSION = 3;

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

export interface AppAssistant {
  /** What the person is looking at now; null when nothing is. Replaces the previous call's value. */
  setContext(context: AppAssistantContext | null): void;
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
  /** Go to `path` inside the module (`/`, `/t/42?tab=notes#n3`); the host owns the address bar. */
  navigate(path: string): void;
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
