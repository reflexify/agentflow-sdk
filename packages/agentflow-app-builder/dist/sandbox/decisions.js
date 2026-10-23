const isRec = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const records = (value) => (Array.isArray(value) ? value.filter(isRec) : []);
const sorted = (keys) => [...keys].sort();
function collect(into, pkg, key) {
    if (typeof pkg !== "string" || typeof key !== "string")
        return;
    const keys = into.get(pkg) ?? new Set();
    keys.add(key);
    into.set(pkg, keys);
}
function fill(given, member, found) {
    if (given[member] !== undefined && !isRec(given[member]))
        return undefined;
    const named = isRec(given[member]) ? given[member] : {};
    const added = [...found].filter(([pkg, keys]) => keys.size > 0 && named[pkg] === undefined);
    if (!added.length)
        return undefined;
    return { ...named, ...Object.fromEntries(added.map(([pkg, keys]) => [pkg, sorted(keys)])) };
}
// The server echoes a sandbox's decisions as they are, so the sandbox's own defaults (every optional feature on,
// every client approved) are the CLI's to add. A package the file names keeps exactly what the file says.
export function sandboxDecisions(given, plan) {
    const setup = isRec(plan.setup) ? plan.setup : {};
    const features = new Map();
    for (const feature of records(setup.features)) {
        if (feature.optional === true)
            collect(features, feature.package, feature.key);
    }
    const document = isRec(plan.document) ? plan.document : {};
    const clients = new Map();
    for (const installation of records(document.installations)) {
        for (const client of records(installation.clients))
            collect(clients, installation.package_id, client.logical_key);
    }
    const result = { ...given };
    const filledFeatures = fill(given, "features", features);
    if (filledFeatures)
        result.features = filledFeatures;
    const filledClients = fill(given, "approved_clients", clients);
    if (filledClients)
        result.approved_clients = filledClients;
    return result;
}
//# sourceMappingURL=decisions.js.map