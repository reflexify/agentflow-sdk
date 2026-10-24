function distance(a, b) {
    let row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        const next = [i];
        for (let j = 1; j <= b.length; j++) {
            next[j] = Math.min(row[j] + 1, next[j - 1] + 1, row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        }
        row = next;
    }
    return row[b.length];
}
const sharedPrefix = (a, b) => {
    let n = 0;
    while (n < a.length && n < b.length && a[n] === b[n])
        n++;
    return n;
};
// Close enough to be useful: a name of up to four letters is one edit away and starts the same three letters
// (user for users, never bolt for bot); a name of five to seven is one edit away; a longer one is two.
function closeEnough(name, candidate, edits) {
    const longer = Math.max(name.length, candidate.length);
    if (longer <= 4)
        return edits <= 1 && sharedPrefix(name, candidate) >= 3;
    return edits <= (longer <= 7 ? 1 : 2);
}
// The candidate a misspelt or compound name most likely meant: one that is close enough, or one that is a
// whole hyphen- or underscore-separated part of the name (folder-kanban names folder).
export function nearest(name, candidates) {
    const lower = name.toLowerCase();
    const near = candidates
        .map((candidate) => ({ candidate, edits: distance(lower, candidate) }))
        .filter(({ edits, candidate }) => closeEnough(lower, candidate, edits))
        .sort((a, b) => a.edits - b.edits)[0];
    if (near)
        return near.candidate;
    const parts = lower.split(/[-_]/).filter(Boolean);
    if (parts.length < 2)
        return undefined;
    return parts.find((part) => candidates.includes(part));
}
//# sourceMappingURL=suggest.js.map