import type { ServerErrorHandler } from './options.js';
/** Hands an error a route swallowed to the host's `onError`, if any. */
export declare function reportError(onError: ServerErrorHandler | undefined, route: string, error: unknown): void;
//# sourceMappingURL=report.d.ts.map