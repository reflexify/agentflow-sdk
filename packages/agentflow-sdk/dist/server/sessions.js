/** In-memory `SessionStore`. Fine for a single dev process; not shared across replicas. */
export class MemorySessionStore {
    records = new Map();
    bySid = new Map();
    async get(id) {
        const record = this.records.get(id);
        if (!record)
            return undefined;
        if (record.expiresAt <= Date.now()) {
            this.forget(id, record.sid);
            return undefined;
        }
        return record;
    }
    async set(id, r) {
        const existing = this.records.get(id);
        if (existing && existing.sid !== r.sid)
            this.unindex(id, existing.sid);
        this.records.set(id, r);
        let ids = this.bySid.get(r.sid);
        if (!ids) {
            ids = new Set();
            this.bySid.set(r.sid, ids);
        }
        ids.add(id);
    }
    async delete(id) {
        const existing = this.records.get(id);
        if (!existing)
            return;
        this.forget(id, existing.sid);
    }
    async deleteBySid(sid) {
        const ids = this.bySid.get(sid);
        if (!ids)
            return 0;
        const count = ids.size;
        for (const id of ids)
            this.records.delete(id);
        this.bySid.delete(sid);
        return count;
    }
    /** Not part of `SessionStore`: a test/ops introspection hook, not a request-path concern. */
    size() {
        return this.records.size;
    }
    forget(id, sid) {
        this.records.delete(id);
        this.unindex(id, sid);
    }
    unindex(id, sid) {
        const ids = this.bySid.get(sid);
        if (!ids)
            return;
        ids.delete(id);
        if (ids.size === 0)
            this.bySid.delete(sid);
    }
}
//# sourceMappingURL=sessions.js.map