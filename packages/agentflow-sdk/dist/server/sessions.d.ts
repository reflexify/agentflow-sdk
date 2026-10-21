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
export declare class MemorySessionStore implements SessionStore {
    private readonly records;
    private readonly bySid;
    get(id: string): Promise<SessionRecord | undefined>;
    set(id: string, r: SessionRecord): Promise<void>;
    delete(id: string): Promise<void>;
    deleteBySid(sid: string): Promise<number>;
    /** Not part of `SessionStore`: a test/ops introspection hook, not a request-path concern. */
    size(): number;
    private forget;
    private unindex;
}
//# sourceMappingURL=sessions.d.ts.map