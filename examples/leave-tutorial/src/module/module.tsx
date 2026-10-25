import type { AppHost } from '@reflexify/agentflow-sdk';
import { createHttpLeaveApi } from './http-leave-api.js';
import { mountLeave } from './mount.js';

/** The leave module: the entry of the package's `ui/`, which AgentFlow imports and calls. */
export function mount(root: ShadowRoot | Element, host: AppHost): () => void {
  return mountLeave(root, host, createHttpLeaveApi(host));
}
