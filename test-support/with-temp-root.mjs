import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { constants, tmpdir } from 'node:os';
import { join } from 'node:path';

// Runs a command with every temp dir it makes under one root, removed when the command ends or is interrupted.
// The examples' configs are copied by `init` into a team's project, so they cannot name test-support/;
// this wrapper is how they leave nothing behind too. The Vitest runs inside use this root rather than make
// their own (the variable is the one test-support/temp-root.ts reads).

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error('usage: node test-support/with-temp-root.mjs <command> [args...]');
  process.exit(2);
}

const root = mkdtempSync(join(tmpdir(), 'agentflow-sdk-test-'));
const finish = (code) => {
  rmSync(root, { recursive: true, force: true, maxRetries: 3 });
  process.exit(code);
};

const child = spawn(command, args, {
  stdio: 'inherit',
  env: { ...process.env, TMPDIR: root, TEMP: root, TMP: root, AGENTFLOW_SDK_TEST_ROOT: root },
  shell: process.platform === 'win32',
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('error', (error) => {
  console.error(`${command}: ${error.message}`);
  finish(127);
});
child.on('exit', (code, signal) => finish(signal ? 128 + constants.signals[signal] : (code ?? 1)));
