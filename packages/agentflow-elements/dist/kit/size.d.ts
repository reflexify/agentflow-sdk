/**
 * A byte count as AgentFlow's attachment rows write it: counted in 1,024s, and under a kilobyte "512 B". Nothing for a count
 * that is not a number or is negative.
 */
export declare function byteSizer(locale: string | null | undefined): (bytes: number | null | undefined) => string;
//# sourceMappingURL=size.d.ts.map