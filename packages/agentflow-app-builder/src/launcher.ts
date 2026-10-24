import { at, isObject, onlyMembers, refuse, translate } from "./core.js";
import { CONFIG_MEMBERS } from "./members.js";

import { nearest } from "./suggest.js";

const W = "package-manifest.json";

// AgentFlow's own icon names, as the frontend's entity icon catalog lists them (they are not Lucide's names).
// A name outside the list installs and draws a dot.
export const LAUNCHER_ICONS: readonly string[] = [
  "database", "building", "users", "group", "contact", "truck", "package", "cart", "receipt", "card", "wallet", "file",
  "contract", "clipboard", "folder", "tags", "box", "boxes", "briefcase", "calendar", "factory", "bank", "pin", "phone",
  "wrench", "shield", "ticket", "rocket", "globe", "star", "flag", "bell", "bookmark", "archive", "layout-dashboard",
  "list-checks", "inbox", "bot", "pause",
];

const OBJECT_TARGET = /^@obj:(dashboard|entity|entity_view):/;

export function launcherOf(source: unknown, hasUi: boolean): Record<string, unknown> {
  const pointer = "/launcher";
  if (!isObject(source)) refuse(W, pointer, "must be an object");
  onlyMembers(source, CONFIG_MEMBERS.launcher!, W, pointer);
  const out: Record<string, unknown> = {};
  if ("launch_url" in source) out.launch_url = source.launch_url;
  if ("entries" in source) {
    if (!Array.isArray(source.entries)) refuse(W, at(pointer, "entries"), "must be an array");
    out.entries = source.entries.map((entry, index) => entryOf(entry, hasUi, at(at(pointer, "entries"), index)));
  }
  return out;
}

// One line per launcher entry whose icon AgentFlow would draw as a dot. The build still succeeds: the platform
// installs such an entry.
export function launcherWarnings(source: unknown): string[] {
  if (!isObject(source) || !Array.isArray(source.entries)) return [];
  return source.entries.flatMap((entry: unknown): string[] => {
    if (!isObject(entry) || typeof entry.icon !== "string" || LAUNCHER_ICONS.includes(entry.icon)) return [];
    const near = nearest(entry.icon, LAUNCHER_ICONS);
    const head = `launcher entry ${String(entry.key)}: icon ${entry.icon} is not one of AgentFlow's icons and draws a dot`;
    return [near ? `${head}; did you mean ${near}?` : `${head} (the names are in the authoring reference, dashboards-and-launcher.md)`];
  });
}

function entryOf(entry: unknown, hasUi: boolean, pointer: string): Record<string, unknown> {
  if (!isObject(entry)) refuse(W, pointer, "must be an object");
  onlyMembers(entry, CONFIG_MEMBERS.launcher_entry!, W, pointer);
  const where = at(pointer, "target");
  const target = entry.target;
  if (!isObject(target)) refuse(W, where, "must be an object");
  onlyMembers(target, CONFIG_MEMBERS.launcher_target!, W, where);
  if (("module" in target) === ("object" in target)) refuse(W, where, "exactly one of module or object");
  let built: Record<string, unknown>;
  if ("module" in target) {
    if (!hasUi) refuse(W, at(where, "module"), "a module target needs the package's ui");
    built = { module: target.module };
  } else {
    const object = translate(target.object, W, at(where, "object"));
    if (typeof object !== "string" || !OBJECT_TARGET.test(object)) {
      refuse(W, at(where, "object"), "must be a ${dashboard:key}, ${entity:key} or ${entity_view:entity/key}");
    }
    built = { object };
  }
  return { ...entry, target: built };
}
