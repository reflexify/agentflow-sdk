/** Hears every `AgentFlow-App-Revision` a client's responses carry. */
export class RevisionTap {
    #listeners = new Set();
    observe(header) {
        if (header === null)
            return;
        const revision = Number(header.trim());
        if (!Number.isSafeInteger(revision) || revision < 0)
            return;
        for (const listener of this.#listeners)
            listener(revision);
    }
    listen(listener) {
        this.#listeners.add(listener);
        return () => this.#listeners.delete(listener);
    }
}
const TAPS = new WeakMap();
export const registerTap = (client, tap) => TAPS.set(client, tap);
export const tapOf = (client) => TAPS.get(client);
//# sourceMappingURL=revision.js.map