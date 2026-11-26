export declare function sandboxDecisions(given: Record<string, unknown>, plan: Record<string, unknown>): Record<string, unknown>;
export declare function otherPackagesAnswered(given: Record<string, unknown>, own: string): string[];
export declare function packagesPlanned(plan: Record<string, unknown>): Set<string> | undefined;
export declare function onlyPackages(given: Record<string, unknown>, planned: Set<string>): {
    kept: Record<string, unknown>;
    dropped: string[];
};
//# sourceMappingURL=decisions.d.ts.map