import fs from "node:fs";
import { at, isObject } from "./core.js";
const ANNOTATIONS = new Set(["$schema", "$id", "$defs", "$comment", "title", "description", "examples", "default", "format"]);
const KEYWORDS = new Set([
    "$ref", "type", "const", "enum", "required", "properties", "items", "minimum", "maximum", "minItems", "maxItems",
    "minLength", "maxLength", "pattern", "not", "allOf", "oneOf", "if", "then", "else",
]);
export class SchemaCheck {
    root;
    name;
    constructor(root, name) {
        this.root = root;
        this.name = name;
    }
    static load(file, name) {
        const root = JSON.parse(fs.readFileSync(file, "utf8"));
        unknownKeywords(root, "", name);
        return new SchemaCheck(root, name);
    }
    static of(root, name) {
        unknownKeywords(root, "", name);
        return new SchemaCheck(root, name);
    }
    /** Every problem with `value`, in document order; the empty list when it fits. */
    problems(value, pointer = "") {
        return this.located(this.root, value, pointer);
    }
    // A value at a location of its own (the root, a member, an item): checked, then closed over its members.
    located(schema, value, pointer) {
        const outcome = this.evaluate(schema, value, pointer);
        if (outcome.problems.length || !isObject(value) || !this.declaresMembers(schema, 0))
            return outcome.problems;
        return Object.keys(value)
            .filter((key) => !outcome.evaluated.has(key))
            .map((key) => ({ pointer: at(pointer, key), message: `a member ${this.name} has no place for here` }));
    }
    evaluate(schema, value, pointer) {
        const problems = [];
        const evaluated = new Set();
        const merge = (outcome) => {
            problems.push(...outcome.problems);
            outcome.evaluated.forEach((key) => evaluated.add(key));
        };
        if (typeof schema.$ref === "string")
            merge(this.evaluate(this.resolve(schema.$ref), value, pointer));
        if (schema.type !== undefined && !typeMatches(schema.type, value)) {
            return { problems: [...problems, { pointer, message: `must be ${typeName(schema.type)}` }], evaluated };
        }
        if ("const" in schema && !same(schema.const, value))
            problems.push({ pointer, message: `must be ${show(schema.const)}` });
        if (Array.isArray(schema.enum) && !schema.enum.some((option) => same(option, value))) {
            problems.push({ pointer, message: `must be one of ${schema.enum.map(show).join(", ")}` });
        }
        if (typeof value === "number") {
            if (typeof schema.minimum === "number" && value < schema.minimum)
                problems.push({ pointer, message: `must be at least ${schema.minimum}` });
            if (typeof schema.maximum === "number" && value > schema.maximum)
                problems.push({ pointer, message: `must be at most ${schema.maximum}` });
        }
        if (typeof value === "string") {
            const length = [...value].length;
            if (typeof schema.minLength === "number" && length < schema.minLength) {
                problems.push({ pointer, message: schema.minLength === 1 ? "must not be empty" : `must be at least ${schema.minLength} characters` });
            }
            if (typeof schema.maxLength === "number" && length > schema.maxLength)
                problems.push({ pointer, message: `must be at most ${schema.maxLength} characters` });
            if (typeof schema.pattern === "string" && !new RegExp(schema.pattern, "u").test(value))
                problems.push({ pointer, message: `must match ${schema.pattern}` });
        }
        if (Array.isArray(value)) {
            if (typeof schema.minItems === "number" && value.length < schema.minItems)
                problems.push({ pointer, message: `must hold at least ${schema.minItems}` });
            if (typeof schema.maxItems === "number" && value.length > schema.maxItems)
                problems.push({ pointer, message: `must hold at most ${schema.maxItems}` });
            if (isObject(schema.items))
                value.forEach((item, i) => problems.push(...this.located(schema.items, item, at(pointer, i))));
        }
        if (isObject(value)) {
            const required = Array.isArray(schema.required) ? schema.required : [];
            for (const key of required)
                if (!(key in value))
                    problems.push({ pointer: at(pointer, key), message: "is required" });
            if (isObject(schema.properties)) {
                for (const [key, member] of Object.entries(schema.properties)) {
                    evaluated.add(key);
                    if (!(key in value) || (value[key] === null && !required.includes(key)))
                        continue;
                    problems.push(...this.located(member, value[key], at(pointer, key)));
                }
            }
        }
        if (isObject(schema.not) && this.evaluate(schema.not, value, pointer).problems.length === 0) {
            problems.push({ pointer, message: "const" in schema.not ? `must not be ${show(schema.not.const)}` : "is not allowed here" });
        }
        for (const branch of Array.isArray(schema.allOf) ? schema.allOf : [])
            merge(this.evaluate(branch, value, pointer));
        if (Array.isArray(schema.oneOf))
            merge(this.oneOf(schema.oneOf, value, pointer));
        if (isObject(schema.if)) {
            const test = this.evaluate(schema.if, value, pointer);
            if (test.problems.length === 0) {
                test.evaluated.forEach((key) => evaluated.add(key));
                if (isObject(schema.then))
                    merge(this.evaluate(schema.then, value, pointer));
            }
            else if (isObject(schema.else)) {
                merge(this.evaluate(schema.else, value, pointer));
            }
        }
        return { problems, evaluated };
    }
    // A tagged union: the arm the value's tag names reports its own problems, so a block of a known type is told
    // what is wrong with it rather than that it matches no arm.
    oneOf(branches, value, pointer) {
        const outcomes = branches.map((branch) => this.evaluate(branch, value, pointer));
        const fits = outcomes.filter((outcome) => outcome.problems.length === 0);
        if (fits.length === 1)
            return fits[0];
        if (fits.length > 1)
            return { problems: [{ pointer, message: "fits more than one shape allowed here" }], evaluated: new Set() };
        const tags = branches.map((branch) => tagOf(this.deref(branch)));
        const key = tags.find((tag) => tag !== null)?.key;
        if (key === undefined || !isObject(value))
            return { problems: [{ pointer, message: "fits none of the shapes allowed here" }], evaluated: new Set() };
        const named = tags.flatMap((tag, i) => (tag !== null && tag.values.some((v) => same(v, value[key])) ? [i] : []));
        if (named.length === 1)
            return outcomes[named[0]];
        const allowed = tags.flatMap((tag) => (tag === null ? [] : tag.values)).map(show).join(", ");
        return { problems: [{ pointer: at(pointer, key), message: key in value ? `must be one of ${allowed}` : `is required: one of ${allowed}` }], evaluated: new Set([key]) };
    }
    declaresMembers(schema, depth) {
        if (depth > 32)
            return false;
        if (isObject(schema.properties) && Object.keys(schema.properties).length > 0)
            return true;
        if (typeof schema.$ref === "string" && this.declaresMembers(this.resolve(schema.$ref), depth + 1))
            return true;
        return ["allOf", "oneOf"].some((key) => Array.isArray(schema[key]) && schema[key].some((branch) => this.declaresMembers(branch, depth + 1)));
    }
    deref(schema) {
        return typeof schema.$ref === "string" ? this.deref(this.resolve(schema.$ref)) : schema;
    }
    resolve(reference) {
        if (reference === "#")
            return this.root;
        const name = /^#\/\$defs\/([^/]+)$/.exec(reference)?.[1];
        const target = name === undefined ? undefined : this.root.$defs?.[name];
        if (!isObject(target))
            throw new Error(`${this.name}: $ref ${reference} does not name one of its $defs`);
        return target;
    }
}
// The member an arm's tag is read from (`type`, `kind`) and the values it admits there.
function tagOf(branch) {
    if (!isObject(branch.properties))
        return null;
    for (const [key, member] of Object.entries(branch.properties)) {
        if (!isObject(member))
            continue;
        if ("const" in member)
            return { key, values: [member.const] };
        if (Array.isArray(member.enum))
            return { key, values: member.enum };
    }
    return null;
}
function unknownKeywords(schema, pointer, name) {
    if (!isObject(schema))
        return;
    for (const [key, value] of Object.entries(schema)) {
        if (ANNOTATIONS.has(key)) {
            if (key === "$defs" && isObject(value))
                for (const [def, body] of Object.entries(value))
                    unknownKeywords(body, `${pointer}/$defs/${def}`, name);
            continue;
        }
        if (!KEYWORDS.has(key))
            throw new Error(`${name} uses ${key} at ${pointer || "/"}, a keyword the builder's schema check does not implement`);
        if (key === "properties" && isObject(value))
            for (const [member, body] of Object.entries(value))
                unknownKeywords(body, `${pointer}/properties/${member}`, name);
        else if (["items", "not", "if", "then", "else"].includes(key))
            unknownKeywords(value, `${pointer}/${key}`, name);
        else if ((key === "allOf" || key === "oneOf") && Array.isArray(value))
            value.forEach((branch, i) => unknownKeywords(branch, `${pointer}/${key}/${i}`, name));
    }
}
function typeMatches(type, value) {
    if (Array.isArray(type))
        return type.some((one) => typeMatches(one, value));
    switch (type) {
        case "string": return typeof value === "string";
        case "number": return typeof value === "number" && Number.isFinite(value);
        case "integer": return Number.isInteger(value);
        case "boolean": return typeof value === "boolean";
        case "object": return isObject(value);
        case "array": return Array.isArray(value);
        case "null": return value === null;
        default: throw new Error(`a schema type the builder's schema check does not know: ${String(type)}`);
    }
}
function typeName(type) {
    if (Array.isArray(type))
        return type.map(typeName).join(" or ");
    return { string: "a string", number: "a number", integer: "a whole number", boolean: "true or false", object: "an object", array: "an array", null: "null" }[type] ?? String(type);
}
function same(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}
const show = (value) => (typeof value === "string" ? value : JSON.stringify(value));
//# sourceMappingURL=schema-check.js.map