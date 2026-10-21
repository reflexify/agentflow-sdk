import type { AppHost } from '@reflexify/agentflow-sdk';
import { mountProjects } from './mount.js';

/** Projects as an app module: the entry a package's `ui/` carries, which AgentFlow imports and calls. */
export function mount(root: ShadowRoot | Element, host: AppHost): () => void {
  return mountProjects(root, host);
}
