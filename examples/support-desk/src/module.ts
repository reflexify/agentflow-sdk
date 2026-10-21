import type { AppHost } from '@reflexify/agentflow-sdk';
import { mountDesk } from './mount.js';

/** The desk as an app module: the entry a package's `ui/` carries, which AgentFlow imports and calls. */
export function mount(root: ShadowRoot | Element, host: AppHost): () => void {
  return mountDesk(root, host);
}
