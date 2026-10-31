export declare function checkPackage(dir: string, { values }?: {
    values?: boolean;
}): Promise<{
    stale: string[];
    missing: string[];
    extra: string[];
    where?: string[];
}>;
//# sourceMappingURL=check.d.ts.map