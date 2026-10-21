import { fromBase64Url } from '../base64url.js';
import type { SessionStore } from './sessions.js';

/** Reports an error a route swallowed into a problem response or a refusal redirect, so a host
 * can log or alert on it instead of it silently becoming a generic `agentflow_error` code. May be
 * async; it is never awaited, so it cannot delay the response, and a synchronous throw or a
 * rejected promise from it is dropped rather than breaking the route or the host process. */
/** `summary` is `describeError(error)`: one line that is safe to log, where the error object is not. */
export type ServerErrorHandler = (
  error: unknown,
  context: { route: string; summary: string },
) => void | Promise<void>;

export interface AgentFlowServerOptions {
  issuer: string;
  clientId: string;
  privateKey: CryptoKey;
  privateKeyId?: string;
  redirectUri: string;
  postLogoutRedirectUri?: string;
  apiBaseUrl: string;
  resource: string;
  orgHint?: string;
  sessions: SessionStore;
  sessionKey: string;
  basePath?: string;
  secureCookies?: boolean;
  afterSignIn?: string;
  sessionTtlSeconds?: number;
  allowInsecureRequests?: boolean;
  fetch?: typeof fetch;
  onError?: ServerErrorHandler;
}

export interface ResolvedAgentFlowServerOptions extends AgentFlowServerOptions {
  basePath: string;
  secureCookies: boolean;
  afterSignIn: string;
  sessionTtlSeconds: number;
  loginCookieName: string;
  sessionCookieName: string;
}

const DEFAULT_BASE_PATH = '/agentflow';
const DEFAULT_AFTER_SIGN_IN = '/';
const DEFAULT_SESSION_TTL_SECONDS = 43_200;

/** Fills in every optional field's default, derives the two cookie names from `secureCookies`, and
 * trims trailing slashes from `apiBaseUrl` so every route can append `/{path}` to it. */
export function resolveOptions(options: AgentFlowServerOptions): ResolvedAgentFlowServerOptions {
  checkSessionKey(options.sessionKey);
  const basePath = normalizeBasePath(options.basePath ?? DEFAULT_BASE_PATH);
  const secureCookies = options.secureCookies ?? true;
  return {
    ...options,
    apiBaseUrl: options.apiBaseUrl.replace(/\/+$/, ''),
    basePath,
    secureCookies,
    afterSignIn: options.afterSignIn ?? DEFAULT_AFTER_SIGN_IN,
    sessionTtlSeconds: options.sessionTtlSeconds ?? DEFAULT_SESSION_TTL_SECONDS,
    loginCookieName: secureCookies ? '__Host-agentflow_login' : 'agentflow_login',
    sessionCookieName: secureCookies ? '__Host-agentflow_session' : 'agentflow_session',
  };
}

function normalizeBasePath(basePath: string): string {
  const trimmed = basePath.replace(/\/+$/, '');
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

const SESSION_KEY_BYTES = 32;

/** Refuses a bad `sessionKey` at construction. Otherwise it would surface only on the first
 * sign-in, as a failure to seal the login cookie. The message never includes the key. */
function checkSessionKey(sessionKey: unknown): void {
  let problem: string;
  if (typeof sessionKey !== 'string') {
    problem = 'it is missing';
  } else {
    let bytes: number | undefined;
    try {
      bytes = fromBase64Url(sessionKey).byteLength;
    } catch {
      bytes = undefined;
    }
    if (bytes === SESSION_KEY_BYTES) return;
    problem = bytes === undefined ? 'it is not base64url' : `it decodes to ${bytes} bytes`;
  }
  throw new Error(
    `AgentFlow server misconfigured: sessionKey must be ${SESSION_KEY_BYTES} random bytes, base64url-encoded (43 characters); ${problem}`,
  );
}
