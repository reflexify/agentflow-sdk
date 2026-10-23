import type { AgentFlowClient } from '../client.js';

/** Hears every `AgentFlow-App-Revision` a client's responses carry. */
export class RevisionTap {
  readonly #listeners = new Set<(revision: number) => void>();
  observe(header: string | null): void {
    if (header === null) return;
    const revision = Number(header.trim());
    if (!Number.isSafeInteger(revision) || revision < 0) return;
    for (const listener of this.#listeners) listener(revision);
  }
  listen(listener: (revision: number) => void): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }
}

const TAPS = new WeakMap<AgentFlowClient, RevisionTap>();
export const registerTap = (client: AgentFlowClient, tap: RevisionTap) => TAPS.set(client, tap);
export const tapOf = (client: AgentFlowClient): RevisionTap | undefined => TAPS.get(client);
