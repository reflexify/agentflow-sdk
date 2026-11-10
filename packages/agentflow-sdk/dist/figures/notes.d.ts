import type { components } from '../generated/public.js';
import type { CapNote } from './types.js';
type Schemas = components['schemas'];
/** What a capped figure claims. A lower bound is "at least", an upper bound "at most", and a
 *  figure with no bound is over a sample. Null when nothing was capped. */
export declare function capNote(population: Pick<Schemas['PopulationInfo'], 'capped' | 'cap'> | null | undefined, bound: Schemas['CapBound'] | null | undefined): CapNote | null;
/** Why a figure covers less than it seems to, in the order a tile lists them. */
export type CoverageNote = 'unfiltered' | 'declined' | 'emptied' | 'targets_withheld' | 'partial';
/** The coverage notes a tile shows, one for each flag the server set. */
export declare function coverageNotes(coverage: Schemas['Coverage'] | null | undefined): CoverageNote[];
/** What a reader needs to know about one measure's figure. */
export type MeasureNote = {
    code: 'unweighted_average';
} | {
    code: 'skipped';
    count: number;
};
/** A measure's notes: an average of percents that weighs every record alike, and the records a
 *  duration skipped for want of either date. */
export declare function measureNotes(result: Pick<Schemas['MeasureResult'], 'advisory' | 'skipped'> | null | undefined): MeasureNote[];
export {};
//# sourceMappingURL=notes.d.ts.map