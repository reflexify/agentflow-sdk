import path from "node:path";
import { at, clip, isObject, onlyMembers, readJson, refuse, translate } from "./core.js";
import { xEntity } from "./entity.js";
import { CONFIG_MEMBERS } from "./members.js";
const KEY = /^[a-z][a-z0-9_]*$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BLOCK_TYPES = ["text", "heading", "blockquote", "column_group", "row", "image", "table", "static_table", "page_break", "spacer", "rich_text"];
const ENVELOPE = ["mode", "kind", "block_tree"];
// The same walk the platform's layout check makes: a dotted path down `properties`.
function resolves(schema, dotted) {
    let current = schema;
    for (const segment of dotted.split(".")) {
        const properties = isObject(current) ? current.properties : undefined;
        if (!isObject(properties) || !Object.hasOwn(properties, segment))
            return false;
        current = properties[segment];
    }
    return true;
}
const IMAGE = "a packaged template cannot hold an image yet: AgentFlow renders no image from a submission field, and a package carries no template asset";
// What the platform refuses when it installs a layout, checked here with a location: block ids that are not
// UUIDs, a kind of block it does not know, any image and a field reference the schema does not hold. Inside a static table's repeated row a reference reads the row's
// item, not the schema, so those are left to the platform.
function checkBlocks(blocks, schema, where, pointer, scoped) {
    if (!Array.isArray(blocks))
        refuse(where, pointer, "must be an array");
    blocks.forEach((block, i) => {
        const here = at(pointer, i);
        if (!isObject(block))
            refuse(where, here, "must be an object");
        if (typeof block.id !== "string" || !UUID.test(block.id))
            refuse(where, at(here, "id"), `must be a UUID, such as 0190f8f4-0000-7000-8000-000000000001`);
        const type = block.type;
        if (!BLOCK_TYPES.includes(type))
            refuse(where, at(here, "type"), `a block type the builder has no rule for: ${clip(String(type))}`);
        // As the platform: any expression on a field_ref skips the path check, a non-empty one on a rich_text block.
        if (Array.isArray(block.content) && scoped) {
            block.content.forEach((node, j) => {
                if (!isObject(node) || node.type !== "field_ref" || typeof node.expression === "string" || typeof node.path !== "string" || node.path === "")
                    return;
                if (!resolves(schema, node.path))
                    refuse(where, at(at(at(here, "content"), j), "path"), `${clip(node.path)} is not a property of schema_json`);
            });
        }
        const richExpression = typeof block.expression === "string" && block.expression !== "";
        if (type === "rich_text" && scoped && typeof block.path === "string" && block.path !== "" && !richExpression && !resolves(schema, block.path)) {
            refuse(where, at(here, "path"), `${clip(block.path)} is not a property of schema_json`);
        }
        if (type === "image")
            refuse(where, at(here, "type"), IMAGE);
        if (type === "column_group" || type === "row") {
            if (!Array.isArray(block.columns))
                refuse(where, at(here, "columns"), "must be an array");
            block.columns.forEach((column, c) => {
                const there = at(at(here, "columns"), c);
                if (!isObject(column))
                    refuse(where, there, "must be an object");
                checkBlocks(column.blocks, schema, where, at(there, "blocks"), scoped);
            });
        }
        if (type === "static_table") {
            if (!Array.isArray(block.rows))
                refuse(where, at(here, "rows"), "must be an array");
            block.rows.forEach((row, r) => {
                const there = at(at(here, "rows"), r);
                if (!isObject(row) || !Array.isArray(row.cells))
                    refuse(where, at(there, "cells"), "must be an array");
                const rowScoped = scoped && row.loop_source === undefined;
                row.cells.forEach((cell, c) => {
                    const cellAt = at(at(there, "cells"), c);
                    if (!isObject(cell))
                        refuse(where, cellAt, "must be an object");
                    checkBlocks(cell.blocks, schema, where, at(cellAt, "blocks"), rowScoped);
                });
            });
        }
    });
}
function checkLayout(template, schema, where) {
    const pointer = "/template";
    if (isObject(template) && ENVELOPE.some((member) => member in template)) {
        refuse(where, pointer, "the export's {mode, kind, block_tree} envelope: a package carries the bare block tree {version, blocks}; move block_tree's members up into template");
    }
    if (!isObject(template))
        refuse(where, pointer, "must be a block tree {version, blocks}");
    onlyMembers(template, CONFIG_MEMBERS.block_tree, where, pointer);
    if (template.version !== 1)
        refuse(where, at(pointer, "version"), "must be 1");
    if (template.settings != null && !isObject(template.settings))
        refuse(where, at(pointer, "settings"), "must be an object");
    checkBlocks(template.blocks, schema, where, at(pointer, "blocks"), true);
    for (const region of ["header", "footer"]) {
        if (template[region] == null)
            continue;
        const value = template[region];
        if (!isObject(value))
            refuse(where, at(pointer, region), "must be an object");
        onlyMembers(value, CONFIG_MEMBERS.block_region, where, at(pointer, region));
        checkBlocks(value.blocks, schema, where, at(at(pointer, region), "blocks"), true);
    }
}
export function documentTemplateObject(configDir, fileName, entities) {
    const where = `document_templates/${fileName}`;
    const file = readJson(path.join(configDir, where));
    if (!isObject(file))
        return refuse(where, "", "must be an object");
    onlyMembers(file, CONFIG_MEMBERS.document_template, where, "");
    const stem = fileName.slice(0, -".json".length);
    if (typeof file.key !== "string" || !KEY.test(file.key))
        refuse(where, "/key", "must be a key like approval_letter");
    if (file.key !== stem)
        refuse(where, "/key", `is ${file.key}, not ${stem}`);
    if (typeof file.name !== "string" || file.name.trim() === "")
        refuse(where, "/name", "a non-empty string");
    if (file.description != null && typeof file.description !== "string")
        refuse(where, "/description", "must be a string, or null");
    if (!isObject(file.schema_json) || ("properties" in file.schema_json && !isObject(file.schema_json.properties))) {
        refuse(where, "/schema_json", "must be an object (a JSON Schema whose properties the layout reads)");
    }
    if ("sensitive_field_paths" in file) {
        const paths = file.sensitive_field_paths;
        if (!Array.isArray(paths) || !paths.every((p) => typeof p === "string"))
            refuse(where, "/sensitive_field_paths", "must be an array of strings");
    }
    // A template may have no layout yet, as AgentFlow allows: it installs, and renders nothing until laid out.
    if (file.template != null)
        checkLayout(file.template, file.schema_json, where);
    const body = { name: file.name };
    if (file.description != null)
        body.description = file.description;
    body.schema_json = translate(file.schema_json, where, "/schema_json", { "x-entity": xEntity(entities) });
    if ("sensitive_field_paths" in file)
        body.sensitive_field_paths = file.sensitive_field_paths;
    if (file.template != null)
        body.template = translate(file.template, where, "/template");
    return [`document_template:${stem}`, body];
}
//# sourceMappingURL=document-template.js.map