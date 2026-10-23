import type { AuthAdapter } from './auth.js';
import { matchOperation } from './operations.js';

const RETRYABLE = new Set([429, 503]);
const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

const DEFAULT_DELAY_MS = 1000;
const MAX_DELAY_SECONDS = 30;

/** `Retry-After` in seconds, capped at 30. An absent or empty header must not read as zero
 * (`Number(null) === 0`): that retries at once, against a server that has just said it is busy.
 * An HTTP-date is not parsed and gets the default too. */
function delayMs(res: Response): number {
  const header = res.headers.get('retry-after')?.trim();
  if (!header) return DEFAULT_DELAY_MS;
  const s = Number(header);
  return Number.isFinite(s) && s >= 0 ? Math.min(s, MAX_DELAY_SECONDS) * 1000 : DEFAULT_DELAY_MS;
}

/** The transport-level fetch openapi-fetch actually calls: always with a single `Request`, never a string/URL. */
export type RequestFetch = (input: Request) => Promise<Response>;

/** A fetch that authenticates, keys idempotent writes, and retries only when repeating is safe. */
export function agentflowFetch(opts: { baseUrl: string; auth: AuthAdapter; fetch: RequestFetch; maxRetries: number; onRevision?: (header: string | null) => void }) {
  const base = new URL(opts.baseUrl);
  // Called bare: `opts.fetch(...)` would make `opts` the receiver, which a browser's fetch refuses.
  const send = opts.fetch;
  return async (input: Request): Promise<Response> => {
    const path = new URL(input.url).pathname.slice(base.pathname.replace(/\/$/, '').length);
    const op = matchOperation(input.method, path);
    const headers = new Headers(input.headers);
    for (const [k, v] of Object.entries(await opts.auth.headers())) headers.set(k, v);
    if (op?.idempotent && !headers.has('idempotency-key')) headers.set('idempotency-key', crypto.randomUUID());
    const template = new Request(input, { headers, credentials: opts.auth.credentials });
    const repeatable = SAFE.has(template.method) || headers.has('idempotency-key');
    for (let attempt = 0; ; attempt++) {
      const res = await send(template.clone());
      const retryable =
        RETRYABLE.has(res.status) ||
        (res.status === 409 && (await res.clone().json().catch(() => ({})))?.type === 'IDEMPOTENCY_KEY_IN_PROGRESS');
      if (!retryable || !repeatable || attempt >= opts.maxRetries) {
        opts.onRevision?.(res.headers.get('agentflow-app-revision'));
        return res;
      }
      await new Promise((r) => setTimeout(r, delayMs(res)));
    }
  };
}
