import type { Writable } from "node:stream";
import type { Env } from "./platform.js";
export interface Io {
    cwd: string;
    stdout: Writable;
    stderr: Writable;
    env?: Env;
    secrets?: Set<string>;
    openUrl?: (url: string) => Promise<void>;
    sleep?: (ms: number, signal: AbortSignal) => Promise<void>;
    now?: () => number;
    onInterrupt?: (listener: () => void) => () => void;
}
export type Values = Record<string, string | boolean | undefined>;
export type Outcome = {
    data: unknown;
    text: string[];
    note?: string;
    exit?: number;
};
export type Handler = (values: Values, io: Io, positionals: string[]) => Promise<Outcome>;
export declare class UsageError extends Error {
}
export declare function usage(message: string): never;
export declare const stringFlag: (values: Values, name: string) => string | undefined;
export declare const hideSecret: (io: Io, secret: string) => void;
export declare const envOf: (io: Io) => Env;
//# sourceMappingURL=command.d.ts.map