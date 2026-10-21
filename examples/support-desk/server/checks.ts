import { describeError } from '@reflexify/agentflow-sdk/server';
import { ENTITY_KEYS, WORKFLOW_KEYS } from '../shared/contract.js';
import { ConfigError, DEFAULT_DESK_CONFIG_FILE, loadConfig, type DeskConfig } from './config.js';

/** `warning` marks a check that passes but that the person should read. */
export interface Check { name: string; ok: boolean; detail: string; warning?: true }

export interface CheckOptions { timeoutMs?: number }

const isTimeout = (error: unknown) => error instanceof Error && error.name === 'TimeoutError';

// fetch reports every network failure as "TypeError: fetch failed" and keeps the reason in the
// cause's code, which describeError names as the server's log does.
function explain(error: unknown, timeoutMs: number): string {
  return isTimeout(error) ? `timed out: no answer within ${timeoutMs} ms` : describeError(error);
}

// The URL the SDK's discovery fetches: an issuer that already names a /.well-known/ document is
// fetched as it is and its issuer is taken as given; any other gets the OIDC suffix on its path.
function discoveryUrl(issuer: string): { url: string; direct: boolean } {
  const url = new URL(issuer);
  if (url.href.includes('/.well-known/')) return { url: url.href, direct: true };
  url.pathname = `${url.pathname}/.well-known/openid-configuration`.replace('//', '/');
  return { url: url.href, direct: false };
}

// The SDK compares the two as parsed URLs and nothing looser, so a trailing slash is a mismatch.
function sameIssuer(reported: unknown, configured: string): boolean {
  if (typeof reported !== 'string') return false;
  try {
    return new URL(reported).href === new URL(configured).href;
  } catch {
    return false;
  }
}

function jsonObject(text: string): Record<string, unknown> | undefined {
  try {
    const value: unknown = JSON.parse(text);
    return value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
  } catch {
    return undefined;
  }
}

async function checkProvider(config: DeskConfig, fetchImpl: typeof fetch, timeoutMs: number): Promise<Check[]> {
  const provider = (ok: boolean, detail: string): Check => ({ name: 'identity provider', ok, detail });
  const notChecked = (why: string): Check => ({ name: 'private_key_jwt', ok: false, detail: `not checked: ${why}` });

  const { url, direct } = discoveryUrl(config.issuer);
  let res: Response;
  let text: string;
  try {
    res = await fetchImpl(url, { headers: { accept: 'application/json' }, redirect: 'manual', signal: AbortSignal.timeout(timeoutMs) });
    text = await res.text();
  } catch (error) {
    return [provider(false, explain(error, timeoutMs)), notChecked('discovery unreachable')];
  }
  if (res.status !== 200) return [provider(false, `discovery answered ${res.status}`), notChecked(`discovery answered ${res.status}`)];
  const doc = jsonObject(text);
  if (!doc) return [provider(false, 'discovery document is not a JSON object'), notChecked('discovery document is not a JSON object')];

  const missing = ['authorization_endpoint', 'token_endpoint', 'jwks_uri'].filter((k) => typeof doc[k] !== 'string');
  const reported = typeof doc.issuer === 'string' ? `issuer ${JSON.stringify(doc.issuer)}` : 'no issuer';
  // Direct mode takes the issuer as given, but the SDK still refuses a document without one.
  const issuerProblem = direct
    ? typeof doc.issuer === 'string' && doc.issuer !== '' ? undefined : 'discovery reports no issuer; the SDK requires one'
    : sameIssuer(doc.issuer, config.issuer)
      ? undefined
      : `discovery reports ${reported}, but AGENTFLOW_ISSUER is ${JSON.stringify(config.issuer)}; the SDK requires them to match exactly`;
  const checks = [
    issuerProblem
      ? provider(false, issuerProblem)
      : missing.length
        ? provider(false, `discovery lacks ${missing.join(', ')}`)
        : provider(true, 'discovery ok'),
  ];

  const methods = doc.token_endpoint_auth_methods_supported;
  if (!Array.isArray(methods)) {
    checks.push({
      name: 'private_key_jwt',
      ok: true,
      detail: "provider does not list its methods; OIDC's default is client_secret_basic, so sign-in may fail if private_key_jwt is not accepted",
    });
  } else {
    const supportsJwt = methods.includes('private_key_jwt');
    checks.push({ name: 'private_key_jwt', ok: supportsJwt, detail: supportsJwt ? 'supported' : `provider offers ${JSON.stringify(methods)}` });
  }
  return checks;
}

async function checkApi(config: DeskConfig, fetchImpl: typeof fetch, timeoutMs: number): Promise<Check> {
  try {
    const res = await fetchImpl(`${config.apiBaseUrl}/caller`, { signal: AbortSignal.timeout(timeoutMs) });
    return {
      name: 'AgentFlow API',
      ok: res.status === 401,
      detail: res.status === 401 ? 'reachable, wants a token' : `GET /caller without a token answered ${res.status}, expected 401`,
    };
  } catch (error) {
    return { name: 'AgentFlow API', ok: false, detail: explain(error, timeoutMs) };
  }
}

// loadConfig has already refused a desk config with a missing or malformed id, listing every one of
// them under `configuration`, so reaching this check means the file parsed; it says which file.
function checkDeskConfig(env: Record<string, string | undefined>): Check {
  const file = env.SUPPORT_DESK_CONFIG_FILE?.trim() || DEFAULT_DESK_CONFIG_FILE;
  return {
    name: 'desk config',
    ok: true,
    detail: `${file}: ${ENTITY_KEYS.length} entities, ${WORKFLOW_KEYS.length} workflows and the support group`,
  };
}

const RETIRED = ['SUPPORT_DESK_RELAY_API_KEY', 'SUPPORT_DESK_WEBHOOK_SECRET'] as const;

// Live updates come from AgentFlow's event stream through the desk's own proxy, so there is nothing to set here. The
// relay's two variables are no longer read; still set, they usually mean its webhook subscription still posts here.
function checkLive(env: Record<string, string | undefined>): Check {
  const name = 'live updates';
  const left = RETIRED.filter((variable) => env[variable]?.trim());
  if (left.length > 0) {
    const one = left.length === 1;
    return {
      name,
      ok: true,
      warning: true,
      detail: `${left.join(' and ')} ${one ? 'is' : 'are'} no longer read: remove ${one ? 'it' : 'them'} from .env, and delete the relay's webhook subscription in Admin → Webhooks (RUNBOOK, The desk, step 7)`,
    };
  }
  return { name, ok: true, detail: "from AgentFlow's event stream: the rail reads Live once AgentFlow has REALTIME_CHANNEL_ENABLED on (RUNBOOK, The desk, step 7)" };
}

export async function runChecks(
  env: Record<string, string | undefined>,
  fetchImpl: typeof fetch,
  readText?: (path: string) => Promise<string>,
  { timeoutMs = 10_000 }: CheckOptions = {},
): Promise<Check[]> {
  let config: DeskConfig;
  try {
    config = await loadConfig(env, readText);
  } catch (error) {
    return [{ name: 'configuration', ok: false, detail: error instanceof ConfigError ? error.message : describeError(error) }];
  }

  return [
    { name: 'configuration', ok: true, detail: `client ${config.clientId}, origin ${config.origin}` },
    ...(await checkProvider(config, fetchImpl, timeoutMs)),
    await checkApi(config, fetchImpl, timeoutMs),
    checkDeskConfig(env),
    checkLive(env),
  ];
}
