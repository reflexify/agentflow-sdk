import fs from 'node:fs';
import path from 'node:path';

export type SandboxFile = {
  version: 1;
  url: string;
  id: string;
  name: string;
  created_at: string;
  expires_at: string;
  deploy_key: string;
  owner: string;
  people: Record<string, { user_id: string; token: string }>;
  ids: { groups: Record<string, string>; units: Record<string, string>; principals: Record<string, string>; connections: Record<string, string> };
  install: { parameters: Record<string, unknown>; decisions: Record<string, unknown> };
  installation: null | {
    id: string;
    deployment_id: string;
    package_id: string;
    version: string;
    armed: string[];
    objects: Record<string, string>;
    parameters: Record<string, unknown>;
  };
};

const FILE = '.agentflow/sandbox.json';
const COMMAND = 'pnpm exec agentflow-app deploy --sandbox';

type Rec = Record<string, unknown>;
const isRec = (value: unknown): value is Rec => typeof value === 'object' && value !== null && !Array.isArray(value);
const filled = (value: unknown): value is string => typeof value === 'string' && value !== '';

function shaped(value: unknown): value is SandboxFile {
  if (!isRec(value) || value.version !== 1) return false;
  if (!filled(value.url) || !filled(value.id) || !filled(value.owner)) return false;
  const people = value.people;
  if (!isRec(people) || !Object.values(people).every((p) => isRec(p) && filled(p.user_id) && filled(p.token))) return false;
  return value.installation === null || isRec(value.installation);
}

export function readSandbox(dir?: string): SandboxFile {
  const base = dir ?? process.cwd();
  const file = path.join(base, FILE);
  let raw: string;
  try {
    raw = fs.readFileSync(file, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`no ${FILE} in ${base}: run ${COMMAND} first`);
    }
    throw error;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = undefined;
  }
  if (!shaped(parsed)) {
    const version = isRec(parsed) ? String(parsed.version) : 'unknown';
    throw new Error(`${file} is not a sandbox file this SDK reads (version ${version}): run ${COMMAND} with this SDK's CLI`);
  }
  return parsed;
}
