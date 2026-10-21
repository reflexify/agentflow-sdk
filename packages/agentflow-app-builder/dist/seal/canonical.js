import { SealError } from "../errors.js";
export function canonicalJson(value) {
    if (value === null || typeof value === "boolean" || typeof value === "string")
        return JSON.stringify(value);
    if (typeof value === "number") {
        if (!Number.isFinite(value))
            throw new SealError("SEAL_JSON_INVALID", "a number that is not finite");
        return JSON.stringify(value);
    }
    if (Array.isArray(value))
        return `[${value.map(canonicalJson).join(",")}]`;
    if (typeof value === "object") {
        const record = value;
        const keys = Object.keys(record).sort();
        return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(record[k])}`).join(",")}}`;
    }
    throw new SealError("SEAL_JSON_INVALID", `not JSON: ${typeof value}`);
}
//# sourceMappingURL=canonical.js.map