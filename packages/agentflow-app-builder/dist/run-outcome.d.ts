export declare const RUN_OUTCOME = "run_outcome";
export declare const RUN_OUTCOME_PLATFORM = "2027.11";
export declare const RUN_OUTCOMES: readonly ["failed", "paused_on_access", "cancelled"];
export type RunOutcome = (typeof RUN_OUTCOMES)[number];
interface Trigger {
    workflow: string;
    kind: string;
    config?: unknown;
}
export interface Watch {
    watched: string[];
    outcomes: RunOutcome[];
}
export declare function runOutcomeWatch(name: string, trigger: Trigger, workflowKeys: ReadonlySet<string>): Watch;
export declare const holdsRunOutcome: (triggers: Record<string, Trigger>) => boolean;
export declare function runOutcomeWarnings(triggers: Record<string, Trigger>, workflowKeys: ReadonlySet<string>): string[];
export declare function checkRunOutcomeSubjects(triggers: Record<string, Trigger>, workflows: ReadonlyMap<string, Record<string, unknown>>): void;
export {};
//# sourceMappingURL=run-outcome.d.ts.map