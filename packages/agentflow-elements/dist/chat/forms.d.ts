import type { ChatKey } from './strings.js';
import { type VerifyMethod } from './transport.js';
export interface SheetActions {
    sendCode(email: string): Promise<void>;
    confirmCode(code: string): Promise<void>;
    startSignIn(): Promise<string>;
    confirmSignIn(code: string): Promise<void>;
    giveEmail(email: string): Promise<void>;
    verified(): void;
    emailGiven(): void;
    hidden(): void;
}
export declare class ChatSheet {
    #private;
    readonly node: HTMLElement;
    constructor(t: (key: ChatKey) => string, actions: SheetActions);
    askVerify(methods: VerifyMethod[]): void;
    askEmail(): void;
    hide(): void;
    /** The next visitor on a shared device never sees this one's address. */
    clear(): void;
    paint(): void;
}
//# sourceMappingURL=forms.d.ts.map