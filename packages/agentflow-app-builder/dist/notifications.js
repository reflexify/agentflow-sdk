import { at, isObject, onlyMembers, refuse } from "./core.js";
import { CONFIG_MEMBERS } from "./members.js";
const W = "package-manifest.json";
const MAX_KINDS = 50;
const MAX_LABEL_CHARS = 60;
const MAX_TITLE_CHARS = 120;
const MAX_BODY_CHARS = 500;
const MAX_MODULE_PATH_CHARS = 200;
const RECORD_ID_PLACEHOLDER = "{{ record_id }}";
const NIL_UUID = "00000000-0000-0000-0000-000000000000";
// The external channels default_channels may name. In-app is on until a person turns it off, so it is never a
// default to declare.
const DEFAULT_CHANNELS = ["email"];
const LOCAL_KEY = /^[a-z][a-z0-9_]{0,39}$/;
const LANGUAGE_TAG = /^[a-z]{2,3}(-[A-Za-z0-9]{1,8})*$/;
const chars = (text) => [...text.trim()].length;
// Whether text uses only the placeholders a notice fills in: {record}, {actor} and {app}. "{{" is a literal "{";
// "}}" and a lone "}" are kept as they are.
export function templateIsValid(text) {
    let rest = text;
    for (let brace = rest.indexOf("{"); brace !== -1; brace = rest.indexOf("{")) {
        const after = rest.slice(brace + 1);
        if (after.startsWith("{")) {
            rest = after.slice(1);
            continue;
        }
        const name = ["record}", "actor}", "app}"].find((candidate) => after.startsWith(candidate));
        if (name === undefined)
            return false;
        rest = after.slice(name.length);
    }
    return true;
}
// A browser reads "\" as "/", and "%2e" as "." in a dot segment.
function modulePathIsValid(path) {
    const route = path.split(/[?#]/)[0];
    return (path.startsWith("/") &&
        [...path].length <= MAX_MODULE_PATH_CHARS &&
        !path.includes("//") &&
        !path.includes("\\") &&
        !/\p{Cc}/u.test(path) &&
        route.split("/").every((segment) => {
            const dots = segment.toLowerCase().replaceAll("%2e", ".");
            return dots !== ".." && dots !== ".";
        }));
}
// Why a page cannot be where a notice opens, as work.module_page judges a page; undefined when it can.
function openDefect(page, hasUi) {
    if (!hasUi)
        return "needs the package's ui";
    const filled = page.replace(RECORD_ID_PLACEHOLDER, NIL_UUID);
    const valid = page.split(RECORD_ID_PLACEHOLDER).length - 1 <= 1 && !filled.includes("{{") && !filled.includes("}}") && modulePathIsValid(filled);
    return valid ? undefined : `a module path such as /items/${RECORD_ID_PLACEHOLDER}`;
}
// Checks a launcher-style label (text, or a map from language tag to text) and returns its language tags, or
// undefined for one text.
function checkLabel(value, pointer, min, max, template) {
    const text = (item, here) => {
        if (typeof item !== "string")
            refuse(W, here, "must be text");
        if (chars(item) < min || chars(item) > max)
            refuse(W, here, `must be ${min} to ${max} characters`);
        if (template && !templateIsValid(item))
            refuse(W, here, "uses a placeholder other than {record}, {actor} and {app}");
    };
    if (typeof value === "string") {
        text(value, pointer);
        return undefined;
    }
    if (!isObject(value))
        refuse(W, pointer, "must be text or a map from language tag to text");
    const tags = Object.keys(value);
    if (tags.length === 0)
        refuse(W, pointer, "names at least one language");
    for (const tag of tags) {
        if (!LANGUAGE_TAG.test(tag))
            refuse(W, at(pointer, tag), "not a language tag");
        text(value[tag], at(pointer, tag));
    }
    return new Set(tags);
}
function kindOf(kind, hasUi, pointer) {
    if (!isObject(kind))
        refuse(W, pointer, "must be an object");
    onlyMembers(kind, CONFIG_MEMBERS.notification_kind, W, pointer);
    const key = kind.key;
    if (typeof key !== "string" || !LOCAL_KEY.test(key) || key.includes("__")) {
        refuse(W, at(pointer, "key"), "must be lower-case letters, digits and single underscores, starting with a letter, up to 40 characters");
    }
    for (const member of ["label", "title"])
        if (!(member in kind))
            refuse(W, at(pointer, member), "missing");
    const label = checkLabel(kind.label, at(pointer, "label"), 1, MAX_LABEL_CHARS, false);
    const title = checkLabel(kind.title, at(pointer, "title"), 1, MAX_TITLE_CHARS, true);
    // A title in a language the label lacks (or the reverse) would leave the label and the words of one notice in
    // different languages.
    if (label && title && (label.size !== title.size || [...label].some((tag) => !title.has(tag)))) {
        refuse(W, at(pointer, "title"), "must name the same languages as the label");
    }
    if ("body" in kind)
        checkLabel(kind.body, at(pointer, "body"), 0, MAX_BODY_CHARS, true);
    if ("open" in kind) {
        const defect = typeof kind.open === "string" ? openDefect(kind.open, hasUi) : "must be text";
        if (defect)
            refuse(W, at(pointer, "open"), defect);
    }
    if ("default_channels" in kind) {
        const channels = kind.default_channels;
        if (!Array.isArray(channels))
            refuse(W, at(pointer, "default_channels"), "must be an array");
        channels.forEach((channel, index) => {
            const here = at(at(pointer, "default_channels"), index);
            if (typeof channel !== "string" || !DEFAULT_CHANNELS.includes(channel))
                refuse(W, here, `must be one of ${DEFAULT_CHANNELS.join(", ")}`);
            if (channels.indexOf(channel) !== index)
                refuse(W, here, `${channel} is listed twice`);
        });
    }
    return { ...kind };
}
export function notificationsOf(source, hasUi) {
    const pointer = "/notifications";
    if (!isObject(source))
        refuse(W, pointer, "must be an object");
    onlyMembers(source, CONFIG_MEMBERS.notifications, W, pointer);
    const kindsAt = at(pointer, "kinds");
    if (!Array.isArray(source.kinds))
        refuse(W, kindsAt, "must be an array");
    if (source.kinds.length > MAX_KINDS)
        refuse(W, kindsAt, `holds ${source.kinds.length} kinds, and a package may declare at most ${MAX_KINDS}`);
    const seen = new Set();
    const kinds = source.kinds.map((kind, index) => {
        const built = kindOf(kind, hasUi, at(kindsAt, index));
        if (seen.has(built.key))
            refuse(W, at(at(kindsAt, index), "key"), `${String(built.key)} is declared twice`);
        seen.add(built.key);
        return built;
    });
    return { kinds };
}
//# sourceMappingURL=notifications.js.map