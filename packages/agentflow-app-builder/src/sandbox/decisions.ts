type Rec = Record<string, unknown>;

const isRec = (value: unknown): value is Rec => typeof value === "object" && value !== null && !Array.isArray(value);
const records = (value: unknown): Rec[] => (Array.isArray(value) ? value.filter(isRec) : []);
const sorted = (keys: Set<string>): string[] => [...keys].sort();

function collect(into: Map<string, Set<string>>, pkg: unknown, key: unknown): void {
  if (typeof pkg !== "string" || typeof key !== "string") return;
  const keys = into.get(pkg) ?? new Set<string>();
  keys.add(key);
  into.set(pkg, keys);
}

function fill(given: Rec, member: string, found: Map<string, Set<string>>): Rec | undefined {
  if (given[member] !== undefined && !isRec(given[member])) return undefined;
  const named = isRec(given[member]) ? given[member] : {};
  const added = [...found].filter(([pkg, keys]) => keys.size > 0 && named[pkg] === undefined);
  if (!added.length) return undefined;
  return { ...named, ...Object.fromEntries(added.map(([pkg, keys]) => [pkg, sorted(keys)])) };
}

// The server echoes a sandbox's decisions as they are, so the sandbox's own defaults (every optional feature on,
// every client approved) are the CLI's to add. A package the file names keeps exactly what the file says.
export function sandboxDecisions(given: Record<string, unknown>, plan: Record<string, unknown>): Record<string, unknown> {
  const setup = isRec(plan.setup) ? plan.setup : {};
  const features = new Map<string, Set<string>>();
  for (const feature of records(setup.features)) {
    if (feature.optional === true) collect(features, feature.package, feature.key);
  }
  const document = isRec(plan.document) ? plan.document : {};
  const clients = new Map<string, Set<string>>();
  for (const installation of records(document.installations)) {
    for (const client of records(installation.clients)) collect(clients, installation.package_id, client.logical_key);
  }
  const result: Rec = { ...given };
  const filledFeatures = fill(given, "features", features);
  if (filledFeatures) result.features = filledFeatures;
  const filledClients = fill(given, "approved_clients", clients);
  if (filledClients) result.approved_clients = filledClients;
  return result;
}

// Every member of the decisions is a map keyed by package. These are the packages, other than `own`, it answers for.
export function otherPackagesAnswered(given: Record<string, unknown>, own: string): string[] {
  const named = new Set<string>();
  for (const member of Object.values(given)) {
    if (isRec(member)) for (const pkg of Object.keys(member)) if (pkg !== own) named.add(pkg);
  }
  return sorted(named);
}

// The packages a plan installs or upgrades, or undefined when the plan does not say.
export function packagesPlanned(plan: Record<string, unknown>): Set<string> | undefined {
  const document = isRec(plan.document) ? plan.document : {};
  if (!Array.isArray(document.installations)) return undefined;
  const planned = new Set<string>();
  for (const installation of records(document.installations)) {
    if (typeof installation.package_id === "string") planned.add(installation.package_id);
  }
  return planned;
}

// AgentFlow refuses an answer for a package its plan does not write (APP_DECISION_UNMATCHED), such as a dependency an
// upgrade leaves alone because the sandbox holds it already, and a plan asked with one keeps it on the setup. So the
// answers recorded when the sandbox was made are cut to the packages planned before any plan is asked with them.
export function onlyPackages(given: Record<string, unknown>, planned: Set<string>): { kept: Record<string, unknown>; dropped: string[] } {
  const kept: Rec = {};
  const dropped = new Set<string>();
  for (const [member, value] of Object.entries(given)) {
    if (!isRec(value)) {
      kept[member] = value;
      continue;
    }
    const entries: [string, unknown][] = [];
    for (const [pkg, answer] of Object.entries(value)) {
      if (planned.has(pkg)) entries.push([pkg, answer]);
      else dropped.add(pkg);
    }
    if (entries.length) kept[member] = Object.fromEntries(entries);
  }
  return { kept, dropped: sorted(dropped) };
}
