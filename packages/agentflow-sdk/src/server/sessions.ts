export interface SessionRecord {
  sid: string;
  sealed: string;
  expiresAt: number;
}

export interface SessionStore {
  get(id: string): Promise<SessionRecord | undefined>;
  set(id: string, r: SessionRecord): Promise<void>;
  delete(id: string): Promise<void>;
  deleteBySid(sid: string): Promise<number>;
}

/** In-memory `SessionStore`. Fine for a single dev process; not shared across replicas. */
export class MemorySessionStore implements SessionStore {
  private readonly records = new Map<string, SessionRecord>();
  private readonly bySid = new Map<string, Set<string>>();

  async get(id: string): Promise<SessionRecord | undefined> {
    const record = this.records.get(id);
    if (!record) return undefined;
    if (record.expiresAt <= Date.now()) {
      this.forget(id, record.sid);
      return undefined;
    }
    return record;
  }

  async set(id: string, r: SessionRecord): Promise<void> {
    const existing = this.records.get(id);
    if (existing && existing.sid !== r.sid) this.unindex(id, existing.sid);
    this.records.set(id, r);
    let ids = this.bySid.get(r.sid);
    if (!ids) {
      ids = new Set();
      this.bySid.set(r.sid, ids);
    }
    ids.add(id);
  }

  async delete(id: string): Promise<void> {
    const existing = this.records.get(id);
    if (!existing) return;
    this.forget(id, existing.sid);
  }

  async deleteBySid(sid: string): Promise<number> {
    const ids = this.bySid.get(sid);
    if (!ids) return 0;
    const count = ids.size;
    for (const id of ids) this.records.delete(id);
    this.bySid.delete(sid);
    return count;
  }

  /** Not part of `SessionStore`: a test/ops introspection hook, not a request-path concern. */
  size(): number {
    return this.records.size;
  }

  private forget(id: string, sid: string): void {
    this.records.delete(id);
    this.unindex(id, sid);
  }

  private unindex(id: string, sid: string): void {
    const ids = this.bySid.get(sid);
    if (!ids) return;
    ids.delete(id);
    if (ids.size === 0) this.bySid.delete(sid);
  }
}
