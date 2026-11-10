import type { AppHost } from '@reflexify/agentflow-sdk';
import { mountShowcase } from './mount.js';

/** The kit showcase as an app module: the entry of the package's `ui/`, which AgentFlow imports and calls. */
export function mount(root: ShadowRoot | Element, host: AppHost): () => void {
  return mountShowcase(root, host);
}
