import { type ChatLanguage } from './strings.js';
export type Author = 'visitor' | 'agent' | 'person' | 'system';
export interface LoggedMessage {
    position: number;
    author: Author;
    author_display: string | null;
    text: string;
    client_message_id: string | null;
    stream_id?: string;
    stream_segment?: number;
    created_at: string;
}
export interface ChatConfig {
    branding: {
        color: string | null;
        logo_url: string | null;
        languages: ChatLanguage[];
        greetings: Partial<Record<ChatLanguage, string>>;
    };
    verify_methods: string[];
}
export interface OpenedSession {
    token: string;
    expires_at: string;
}
export declare class ChatRefusal extends Error {
    readonly status: number;
    readonly code: string;
    readonly retryAfterMs: number | null;
    constructor(status: number, code: string, retryAfterMs: number | null);
    get unavailable(): boolean;
}
export type VerifyMethod = 'email_code' | 'agentflow';
export type ReplyEvent = {
    kind: 'started' | 'activity';
    stream_id: string;
    segment: number;
    label: string | null;
} | {
    kind: 'delta';
    stream_id: string;
    segment: number;
    text: string;
} | {
    kind: 'done' | 'abandoned';
    stream_id: string;
    segment: number;
};
export type Sleep = (ms: number, signal?: AbortSignal) => Promise<void>;
export interface ChatApiOptions {
    sleep?: Sleep;
    random?: () => number;
}
export type FollowState = 'connecting' | 'live' | 'waiting' | 'ended';
export interface FollowHandlers {
    message(row: LoggedMessage): void;
    typing(until: number | null): void;
    reply(event: ReplyEvent): void;
    verify(methods: VerifyMethod[]): void;
    closed(reason: string): void;
    invalid(): void;
    unavailable(): void;
    unreachable(): void;
    state(state: FollowState): void;
}
export interface Follow {
    stop(): void;
}
export type ChatApi = ReturnType<typeof chatApi>;
export declare function apiOrigin(attribute: string | null, scriptOrigin: string | null, pageOrigin: string): string;
export declare function chatApi(origin: string, publicKey: string, fetchImpl: typeof fetch, options?: ChatApiOptions): {
    config: (failed?: () => void, attempts?: number) => Promise<ChatConfig>;
    openSession: (identityToken?: string) => Promise<OpenedSession>;
    post: (token: string, text: string, clientMessageId: string) => Promise<{
        position: number;
    }>;
    history: (token: string, after: number) => Promise<LoggedMessage[]>;
    close: (token: string) => Promise<void>;
    giveEmail: (token: string, email: string) => Promise<void>;
    sendCode: (token: string, email: string) => Promise<unknown>;
    confirmCode: (token: string, code: string, language: ChatLanguage) => Promise<void>;
    startSignIn: (token: string) => Promise<{
        authorize_url: string;
    }>;
    confirmSignIn: (token: string, code: string, language: ChatLanguage) => Promise<void>;
    follow: (token: string, after: number, on: FollowHandlers) => Follow;
};
//# sourceMappingURL=transport.d.ts.map