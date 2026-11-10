import type { components } from '../generated/public.js';
import type { CapNote } from './types.js';

type Schemas = components['schemas'];

/** What a capped figure claims. A lower bound is "at least", an upper bound "at most", and a
 *  figure with no bound is over a sample. Null when nothing was capped. */
export function capNote(
  population: Pick<Schemas['PopulationInfo'], 'capped' | 'cap'> | null | undefined,
  bound: Schemas['CapBound'] | null | undefined,
): CapNote | null {
  if (!population?.capped) return null;
  const kind = bound === 'lower' ? 'at_least' : bound === 'upper' ? 'at_most' : 'sample';
  return { kind, cap: population.cap ?? null };
}

/** Why a figure covers less than it seems to, in the order a tile lists them. */
export type CoverageNote = 'unfiltered' | 'declined' | 'emptied' | 'targets_withheld' | 'partial';

const COVERAGE_FLAGS: [keyof Schemas['Coverage'], CoverageNote][] = [
  ['unfiltered_by_dashboard_filter', 'unfiltered'],
  ['declined_dashboard_filter', 'declined'],
  ['emptied_by_filter_intersection', 'emptied'],
  ['targets_withheld', 'targets_withheld'],
  ['partial', 'partial'],
];

/** The coverage notes a tile shows, one for each flag the server set. */
export function coverageNotes(coverage: Schemas['Coverage'] | null | undefined): CoverageNote[] {
  if (!coverage) return [];
  return COVERAGE_FLAGS.filter(([flag]) => coverage[flag] === true).map(([, note]) => note);
}

/** What a reader needs to know about one measure's figure. */
export type MeasureNote = { code: 'unweighted_average' } | { code: 'skipped'; count: number };

/** A measure's notes: an average of percents that weighs every record alike, and the records a
 *  duration skipped for want of either date. */
export function measureNotes(
  result: Pick<Schemas['MeasureResult'], 'advisory' | 'skipped'> | null | undefined,
): MeasureNote[] {
  const notes: MeasureNote[] = [];
  if (result?.advisory === 'unweighted_average') notes.push({ code: 'unweighted_average' });
  if (result?.skipped != null && result.skipped > 0) notes.push({ code: 'skipped', count: result.skipped });
  return notes;
}
