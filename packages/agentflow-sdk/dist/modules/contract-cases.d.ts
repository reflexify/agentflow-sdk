import type { components } from '../generated/public.js';
import type { AppHost, AppTheme } from './contract.js';
/**
 * A host under test, with the controls a person has over what it follows. Its API answers
 * `GET /app/objects` with `appObjects`, and `GET /events/stream` with a stream that stays open until the
 * request is aborted, so a channel the host opens goes live and `openStreams` can tell when the host
 * lets it go. A control resolves once the change has happened; the host may tell its listeners later,
 * and the cases wait for that. The controls keep working after `close()`, so a case can check that a
 * closed host tells nobody.
 */
export interface HostHarness {
    host: AppHost;
    /** A person goes back one entry in the address bar's history. */
    back(): Promise<void>;
    /** A person goes forward one entry. */
    forward(): Promise<void>;
    /** A person follows a link to `hash` (`'#n3'`) on the current page. */
    changeHash(hash: string): Promise<void>;
    /** The person's theme becomes `theme`. The cases change only its `mode`. */
    setTheme(theme: AppTheme): Promise<void>;
    setLocale(locale: string): Promise<void>;
    /** What `host.api.GET('/app/objects')` answers in this harness. */
    appObjects: components['schemas']['AppObjects'];
    /** From now on `GET /app/objects` answers `next`, with `next.revision` in the revision header. `appObjects` stays the first answer. */
    setAppObjects(next: components['schemas']['AppObjects']): Promise<void>;
    /** The absolute base of the API the host's `api` calls, e.g. `http://localhost/agentflow/api`. */
    apiBase: string;
    /** How many event streams the host's API is holding open right now. */
    openStreams(): number;
    /** What unmounting the module does to the host. */
    close(): void;
}
/**
 * Builds a fresh harness. Each case makes its own and closes it. Its host may start at any path but
 * one the cases navigate to; the module's `/` is simplest.
 */
export type HostHarnessFactory = () => Promise<HostHarness>;
export interface HostContractCase {
    readonly name: string;
    /** Resolves when the host keeps this part of the contract; otherwise rejects with an `Error` naming what it expected and what it saw. */
    run(make: HostHarnessFactory): Promise<void>;
}
/**
 * The contract v1 cases, framework-neutral: run each against a host, and a failure is the `Error` its
 * `run` rejects with. The SDK runs them against its standalone host, and AgentFlow's frontend against
 * its own, so the two cannot drift.
 */
export declare const HOST_CONTRACT_CASES: readonly HostContractCase[];
//# sourceMappingURL=contract-cases.d.ts.map