const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

const record = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;

export const byKey = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

export function quote(text: string): string {
  return `'${text.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\r/g, "\\r")}'`;
}

export const propertyName = (key: string): string => (IDENTIFIER.test(key) ? key : quote(key));

export function literal(value: unknown): string {
  if (typeof value === "string") return quote(value);
  if (typeof value === "number" || typeof value === "boolean" || value === null) return JSON.stringify(value);
  return "unknown";
}

export function docLine(text: string): string {
  return `/** ${text.replace(/\s+/g, " ").trim().replace(/\*\//g, "*\\/")} */`;
}

const SCALARS: Record<string, string> = { string: "string", number: "number", integer: "number", boolean: "boolean", null: "null" };

type Rendered = { ts: string; union: boolean };

const union = (parts: string[]): Rendered => {
  const distinct = [...new Set(parts)];
  if (distinct.includes("unknown")) return { ts: "unknown", union: false };
  return { ts: distinct.join(" | "), union: distinct.length > 1 };
};

function render(schema: unknown, indent: string): Rendered {
  const s = record(schema);
  if (!s || "$ref" in s) return { ts: "unknown", union: false };
  if ("const" in s) return { ts: literal(s.const), union: false };
  if (Array.isArray(s.enum)) return s.enum.length ? union(s.enum.map(literal)) : { ts: "never", union: false };
  for (const member of ["anyOf", "oneOf"] as const) {
    const options = s[member];
    if (Array.isArray(options) && options.length) return union(options.map((option) => wrapped(render(option, indent))));
  }
  if (Array.isArray(s.type)) {
    return s.type.length ? union(s.type.map((type) => wrapped(render({ ...s, type }, indent)))) : { ts: "unknown", union: false };
  }
  if (typeof s.type !== "string") return { ts: "unknown", union: false };
  const scalar = SCALARS[s.type];
  if (scalar) return { ts: scalar, union: false };
  if (s.type === "array") return { ts: s.items === undefined ? "unknown[]" : `${wrapped(render(s.items, indent))}[]`, union: false };
  if (s.type === "object") return { ts: objectType(s, indent), union: false };
  return { ts: "unknown", union: false };
}

const wrapped = ({ ts, union }: Rendered): string => (union ? `(${ts})` : ts);

function objectType(s: Record<string, unknown>, indent: string): string {
  const inner = `${indent}  `;
  const properties = record(s.properties) ?? {};
  const required = new Set(Array.isArray(s.required) ? s.required.filter((key) => typeof key === "string") : []);
  const lines: string[] = [];
  for (const key of Object.keys(properties).sort(byKey)) {
    const property = properties[key];
    const description = record(property)?.description;
    if (typeof description === "string" && description.trim()) lines.push(`${inner}${docLine(description)}`);
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
export function schemaToTs(schema: unknown, indent: string): string {
  return render(schema, indent).ts;
}
