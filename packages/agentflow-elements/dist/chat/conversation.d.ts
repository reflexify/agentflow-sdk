import type { LoggedMessage, ReplyEvent } from './transport.js';
export type PendingState = 'sending' | 'sent' | 'failed';
export interface Pending {
    clientId: string;
    text: string;
    state: PendingState;
}
export interface Reply {
    streamId: string;
    segment: number;
    afterPosition: number;
    label: string | null;
    text: string;
    done: boolean;
    shown: 'live' | 'unsent' | 'restUnsent';
    parkedSince: number | null;
    resumedSegment: number | null;
}
export interface Conversation {
    rows: LoggedMessage[];
    pending: Pending[];
    typingUntil: number | null;
    replies: Reply[];
}
export type ConversationAction = {
    type: 'write';
    clientId: string;
    text: string;
} | {
    type: 'posted' | 'failed' | 'retry';
    clientId: string;
} | {
    type: 'logged';
    row: LoggedMessage;
    now: number;
} | {
    type: 'reply';
    event: ReplyEvent;
    now: number;
} | {
    type: 'typing';
    until: number | null;
} | {
    type: 'reconnected';
} | {
    type: 'reset';
};
export declare const EMPTY_CONVERSATION: Conversation;
export declare const PARKED_LINE_MS = 1000;
export declare const lineShows: (reply: Reply, now: number) => boolean;
export declare function storedRow(rows: readonly LoggedMessage[], streamId: string, segment: number): LoggedMessage | undefined;
export declare function reduce(c: Conversation, action: ConversationAction): Conversation;
export declare function lastPosition(c: Conversation): number;
//# sourceMappingURL=conversation.d.ts.map