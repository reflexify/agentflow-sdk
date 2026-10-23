const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const record = (value) => typeof value === "object" && value !== null && !Array.isArray(value) ? value : undefined;
export const byKey = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
export function quote(text) {
    return `'${text.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\r/g, "\\r")}'`;
}
export const propertyName = (key) => (IDENTIFIER.test(key) ? key : quote(key));
export function literal(value) {
    if (typeof value === "string")
        return quote(value);
    if (typeof value === "number" || typeof value === "boolean" || value === null)
        return JSON.stringify(value);
    return "unknown";
}
export function docLine(text) {
    return `/** ${text.replace(/\s+/g, " ").trim().replace(/\*\//g, "*\\/")} */`;
}
const SCALARS = { string: "string", number: "number", integer: "number", boolean: "boolean", null: "null" };
const union = (parts) => {
    const distinct = [...new Set(parts)];
    if (distinct.includes("unknown"))
        return { ts: "unknown", union: false };
    return { ts: distinct.join(" | "), union: distinct.length > 1 };
};
function render(schema, indent) {
    const s = record(schema);
    if (!s || "$ref" in s)
        return { ts: "unknown", union: false };
    if ("const" in s)
        return { ts: literal(s.const), union: false };
    if (Array.isArray(s.enum))
        return s.enum.length ? union(s.enum.map(literal)) : { ts: "never", union: false };
    for (const member of ["anyOf", "oneOf"]) {
        const options = s[member];
        if (Array.isArray(options) && options.length)
            return union(options.map((option) => wrapped(render(option, indent))));
    }
    if (Array.isArray(s.type)) {
        return s.type.length ? union(s.type.map((type) => wrapped(render({ ...s, type }, indent)))) : { ts: "unknown", union: false };
    }
    if (typeof s.type !== "string")
        return { ts: "unknown", union: false };
    const scalar = SCALARS[s.type];
    if (scalar)
        return { ts: scalar, union: false };
    if (s.type === "array")
        return { ts: s.items === undefined ? "unknown[]" : `${wrapped(render(s.items, indent))}[]`, union: false };
    if (s.type === "object")
        return { ts: objectType(s, indent), union: false };
    return { ts: "unknown", union: false };
}
const wrapped = ({ ts, union }) => (union ? `(${ts})` : ts);
function objectType(s, indent) {
    const inner = `${indent}  `;
    const properties = record(s.properties) ?? {};
    const required = new Set(Array.isArray(s.required) ? s.required.filter((key) => typeof key === "string") : []);
    const lines = [];
    for (const key of Object.keys(properties).sort(byKey)) {
        const property = properties[key];
        const description = record(property)?.description;
        if (typeof description === "string" && description.trim())
            lines.push(`${inner}${docLine(description)}`);
        lines.push(`${inner}${propertyName(key)}${required.has(key) ? "" : "?"}: ${render(property, inner).ts};`);
    }
    const extra = s.additionalProperties;
    if (extra === true || record(extra)) {
        // Every declared property must be assignable to the index signature, so a typed one is kept only alone.
        const value = extra === true || lines.length ? "unknown" : render(extra, inner).ts;
        lines.push(`${inner}[key: string]: ${value};`);
    }
    return lines.length ? `{\n${lines.join("\n")}\n${indent}}` : "{}";
}
/** A JSON Schema as a TypeScript type, nested object lines indented one step past `indent`. */
export function schemaToTs(schema, indent) {
    return render(schema, indent).ts;
}
//# sourceMappingURL=schema.js.map