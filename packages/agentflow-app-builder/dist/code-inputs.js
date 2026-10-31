// A Code step hands its function a strict accessor: reading a name the step does not declare throws CodeInputError
// at run time, and asking with `"x" in inputs` does not. This finds those reads in the source, by pattern rather than
// by parsing, so a read it cannot see (a computed name, an alias of the accessor) still fails only at run time.
const IDENT = "[A-Za-z_$][\\w$]*";
const QUOTED = `(["'])([^"'\\\\\\n]+)\\1`;
// Members the accessor answers without reading an input: the probes the JavaScript Proxy lets through, and the
// Mapping methods a Python call reaches (`get` is a read, matched on its own).
const OWN = {
    javascript: { always: new Set(["then", "toJSON", "constructor"]), called: new Set() },
    python: { always: new Set(), called: new Set(["keys", "items", "values", "get"]) },
};
const escape = (name) => name.replace(/\$/g, "\\$");
function withoutComments(source, language) {
    if (language === "python")
        return source.replace(/#[^\n]*/g, "");
    return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}
// Names a destructuring pattern `{ a, b: c, d = 1, ...rest }` reads.
const patternNames = (pattern) => pattern
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part && !part.startsWith("..."))
    .map((part) => part.split(/[:=]/)[0].trim())
    .filter((name) => new RegExp(`^${IDENT}$`).test(name));
// The parameter `main` takes its inputs as: a name, or a destructuring pattern whose names are reads.
function accessorOf(code, language) {
    if (language === "python")
        return { name: new RegExp(`\\bdef\\s+main\\s*\\(\\s*(${IDENT})`).exec(code)?.[1] ?? "inputs" };
    const signature = new RegExp(`(?:\\bfunction\\s+main\\s*|\\bmain\\s*=\\s*(?:async\\s*)?(?:function\\s*)?)\\(\\s*(\\{[^}]*\\}|${IDENT})|\\bmain\\s*=\\s*(?:async\\s+)?(${IDENT})\\s*=>`).exec(code);
    const given = signature?.[1] ?? signature?.[2];
    if (given === undefined)
        return { name: "inputs" };
    if (!given.startsWith("{"))
        return { name: given };
    return { name: "inputs", pattern: { names: patternNames(given.slice(1, -1)), index: signature.index } };
}
export function undeclaredInputs(source, language, declared) {
    const code = withoutComments(source, language);
    const accessor = accessorOf(code, language);
    const a = escape(accessor.name);
    const own = OWN[language];
    const reads = (accessor.pattern?.names ?? []).map((name) => [accessor.pattern.index, name]);
    for (const m of code.matchAll(new RegExp(`\\b${a}\\s*(?:\\?\\.|\\.)\\s*(${IDENT})(\\s*\\()?`, "g"))) {
        const name = m[1];
        if (own.always.has(name) || (m[2] !== undefined && own.called.has(name)))
            continue;
        reads.push([m.index, name]);
    }
    for (const m of code.matchAll(new RegExp(`\\b${a}\\s*(?:\\?\\.)?\\[\\s*${QUOTED}\\s*\\]`, "g")))
        reads.push([m.index, m[2]]);
    if (language === "python") {
        for (const m of code.matchAll(new RegExp(`\\b${a}\\.get\\(\\s*${QUOTED}`, "g")))
            reads.push([m.index, m[2]]);
    }
    else {
        for (const m of code.matchAll(new RegExp(`\\{([^{}]*)\\}\\s*=\\s*${a}\\b`, "g"))) {
            for (const name of patternNames(m[1]))
                reads.push([m.index, name]);
        }
    }
    const asked = new Set([...code.matchAll(new RegExp(`${QUOTED}\\s+in\\s+${a}\\b`, "g"))].map((m) => m[2]));
    const known = new Set(declared);
    const missing = [];
    for (const [, name] of reads.sort((x, y) => x[0] - y[0])) {
        if (!known.has(name) && !asked.has(name) && !missing.includes(name))
            missing.push(name);
    }
    return missing;
}
//# sourceMappingURL=code-inputs.js.map