import { readFile } from 'node:fs/promises';
import type { AgentFlowServerOptions, SessionStore } from '@reflexify/agentflow-sdk/server';
import { importPKCS8 } from 'jose';
import { parseDeskIds, type DeskIds } from '../shared/contract.js';

export interface DeskConfig {
  origin: string;
  issuer: string;
  clientId: string;
  privateKey: CryptoKey;
  privateKeyId: string;
  apiBaseUrl: string;
  resource: string;
  orgHint?: string;
  sessionKey: string;
  ids: DeskIds;
  allowInsecureRequests: boolean;
  port: number;
}

/** Where the ids of the ticket app's entities and workflows are read from, unless SUPPORT_DESK_CONFIG_FILE names another file. */
export const DEFAULT_DESK_CONFIG_FILE = 'desk.config.json';

export class ConfigError extends Error {
  override name = 'ConfigError';
}

const SESSION_KEY = /^[A-Za-z0-9_-]{43}$/;
const trimSlash = (s: string) => s.replace(/\/+$/, '');

function httpUrl(s: string): URL | undefined {
  try {
    const url = new URL(s);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : undefined;
  } catch {
    return undefined;
  }
}

export const DEFAULT_ORIGIN = 'http://localhost:5174';
export const ORIGIN_RULE = 'SUPPORT_DESK_ORIGIN must be an http(s) origin with no path, such as http://localhost:5174';

/** The origin as a browser writes it (`HTTPS://Desk.Example:443/` is `https://desk.example`), or
 * `undefined` for anything with a path, a query or another scheme. */
export function originOf(text: string): string | undefined {
  const url = httpUrl(trimSlash(text));
  return url && url.href === `${url.origin}/` ? url.origin : undefined;
}

export async function loadConfig(
  env: Record<string, string | undefined>,
  readText: (path: string) => Promise<string> = (path) => readFile(path, 'utf8'),
): Promise<DeskConfig> {
  const problems: string[] = [];
  const value = (name: string) => env[name]?.trim() || undefined;
  const required = (name: string) => {
    const v = value(name);
    if (!v) problems.push(`${name} is required`);
    return v ?? '';
  };

  const origin = originOf(value('SUPPORT_DESK_ORIGIN') ?? DEFAULT_ORIGIN);
  if (!origin) problems.push(ORIGIN_RULE);
  const issuer = required('AGENTFLOW_ISSUER');
  if (issuer && !httpUrl(issuer)) problems.push('AGENTFLOW_ISSUER must be an absolute http(s) URL');
  const privateKeyId = required('AGENTFLOW_PRIVATE_KEY_ID');
  const sessionKey = required('SUPPORT_DESK_SESSION_KEY');
  if (sessionKey && !SESSION_KEY.test(sessionKey)) {
    problems.push('SUPPORT_DESK_SESSION_KEY must be 32 random bytes in base64url, 43 characters (run `pnpm setup-keys`)');
  }
  const portText = value('PORT') ?? '5174';
  const port = Number(portText);
  if (!/^\d+$/.test(portText) || port < 1 || port > 65535) problems.push('PORT must be an integer from 1 to 65535');
  const apiBaseUrl = trimSlash(value('AGENTFLOW_API_BASE_URL') ?? 'http://localhost:8080/api/v1');
  if (!httpUrl(apiBaseUrl)) problems.push('AGENTFLOW_API_BASE_URL must be an absolute http(s) URL');
  const resourceText = value('AGENTFLOW_RESOURCE');
  if (resourceText && !httpUrl(resourceText)) problems.push('AGENTFLOW_RESOURCE must be an absolute http(s) URL');
  const resource = resourceText ?? `${apiBaseUrl}/rest`;
  const keyFile = value('AGENTFLOW_PRIVATE_KEY_FILE') ?? 'keys/private.pem';
  let privateKey: CryptoKey | undefined;
  try {
    privateKey = await importPKCS8(await readText(keyFile), 'RS256');
  } catch {
    problems.push(`AGENTFLOW_PRIVATE_KEY_FILE (${keyFile}) is not a readable RS256 PKCS#8 key (run \`pnpm setup-keys\`)`);
  }

  const configFile = value('SUPPORT_DESK_CONFIG_FILE') ?? DEFAULT_DESK_CONFIG_FILE;
  let ids: DeskIds | undefined;
  try {
    const parsed = parseDeskIds(JSON.parse(await readText(configFile)));
    problems.push(...parsed.problems.map((p) => `${configFile}: ${p}`));
    ids = parsed.ids;
  } catch {
    problems.push(`SUPPORT_DESK_CONFIG_FILE (${configFile}) is not readable JSON (RUNBOOK, The desk, step 4)`);
  }
  if (problems.length > 0 || !privateKey || !origin || !ids) throw new ConfigError(`Support desk is not configured:\n- ${problems.join('\n- ')}`);

  const config: DeskConfig = {
    origin,
    issuer,
    clientId: value('AGENTFLOW_CLIENT_ID') ?? 'support-desk-dev',
    privateKey,
    privateKeyId,
    apiBaseUrl,
    resource,
    sessionKey,
    ids,
    allowInsecureRequests: new URL(issuer).protocol === 'http:',
    port,
  };
  const orgHint = value('AGENTFLOW_ORG_HINT');
  if (orgHint) config.orgHint = orgHint;
  return config;
}

export function serverOptions(c: DeskConfig, sessions: SessionStore): AgentFlowServerOptions {
  const options: AgentFlowServerOptions = {
    issuer: c.issuer,
    clientId: c.clientId,
    privateKey: c.privateKey,
    privateKeyId: c.privateKeyId,
    redirectUri: `${c.origin}/agentflow/auth/callback`,
    postLogoutRedirectUri: `${c.origin}/`,
    apiBaseUrl: c.apiBaseUrl,
    resource: c.resource,
    sessions,
    sessionKey: c.sessionKey,
    basePath: '/agentflow',
    secureCookies: c.origin.startsWith('https://'),
    afterSignIn: '/',
    allowInsecureRequests: c.allowInsecureRequests,
    onError: (_error, { route, summary }) => console.error(`[agentflow] ${route}: ${summary}`),
  };
  if (c.orgHint) options.orgHint = c.orgHint;
  return options;
}

export function publicConfig(c: DeskConfig) {
  return { basePath: '/agentflow' as const, ids: c.ids };
}
