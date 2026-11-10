import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { constants, tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = 'AGENTFLOW_SDK_TEST_ROOT';
const OWNER = 'AGENTFLOW_SDK_TEST_ROOT_PID';

// A test that forgets to remove its temp dir must not fill the system's: every dir a run makes lives in one root that the run removes.
// A root already in force (a wrapper's, or the run this one was spawned by) is used and left to its owner: nesting would push a unix socket path (tsx's) past its length limit.
// Vitest exits on a signal without tearing down, and its handler is one-shot: timeout(1) signals the child and then its process group, so a second signal kills it before any exit event. These handlers stay and exit through that event.
export function useTempRoot(): string {
  let root = process.env[ROOT];
  if (!root || !existsSync(root)) {
    root = mkdtempSync(join(tmpdir(), 'agentflow-sdk-test-'));
    const own = root;
    process.env[ROOT] = own;
    process.env[OWNER] = String(process.pid);
    process.once('exit', () => rmSync(own, { recursive: true, force: true, maxRetries: 3 }));
    for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => process.exit(128 + constants.signals[signal]));
  }
  process.env.TMPDIR = process.env.TEMP = process.env.TMP = root;
  return root;
}

export default async function setup(): Promise<() => Promise<void>> {
  const root = useTempRoot();
  return async () => {
    if (process.env[OWNER] === String(process.pid)) await rm(root, { recursive: true, force: true, maxRetries: 3 });
  };
}
