import { isObject } from "./core.js";

// The first platform month whose builds read a percentile measure or a duration. An older build accepts a package
// that holds one and fails when it plans the release, so such a package names this month.
export const MEASURES_PLATFORM = "2027.01";

// The first platform month whose builds read the package kind `entity_metric` and a dashboard measure that follows a
// metric by key. An older build refuses the kind, so a package that ships a metric names this month. A dashboard may
// follow only a metric the same build ships, so the kind alone says when a package needs it.
export const METRICS_PLATFORM = "2027.03";

const isPercentileOrDuration = (measure: unknown): boolean =>
  isObject(measure) && (measure.fn === "percentile" || Object.hasOwn(measure, "duration"));

// Whether a dashboard or a view holds a percentile or a duration measure, at any depth: a tile's `measures`, a view
// summary's `metrics` and a stats block's `metrics` are all lists of measures, and only a member of one counts.
export function holdsPercentileOrDuration(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(holdsPercentileOrDuration);
  if (!isObject(value)) return false;
  return Object.entries(value).some(
    ([key, member]) =>
      ((key === "measures" || key === "metrics") && Array.isArray(member) && member.some(isPercentileOrDuration)) ||
      holdsPercentileOrDuration(member),
  );
}
