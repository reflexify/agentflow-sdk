import { at, objectPath } from "../core.js";
import type { Draft, Json } from "./manifest.js";
import { entityTarget, unsentinel, unsupported, shown } from "./unsentinel.js";

export const UI_SOURCE = "ui/built";

export const UI_README = `# ui/

\`built/\` is the UI module as the draft carried it: built output, not source. The build copies it into
\`package/ui/\` as it is (\`ui: { prebuilt: "${UI_SOURCE}" }\` in \`agentflow.app.mjs\`). To change the module, write
its source in this project and build it with Vite instead: point \`ui\` at a \`viteConfig\` and remove this folder.
`;

const only = (body: Json, allowed: readonly string[], where: string): void => {
  for (const key of Object.keys(body)) if (!allowed.includes(key)) unsupported(where, at("", key), "a member the builder does not write");
};

// The inverse of `agentObject`.
export function agentSource(draft: Draft, key: string): Json {
  const where = objectPath(`agent:${key}`);
  const body = draft.take(`agent:${key}`);
  if ("key" in body) unsupported(where, "/key", "an agent's body never names its key");
  return { key, ...(unsentinel(body, where, "") as Json) };
}

const PLAIN_VALUE = (value: string): boolean =>
  /^\S(?:.*\S)?$/.test(value) && !/[\r\n]/.test(value) && !/^["'|>&*!#%@`[{?:,\]}-]/.test(value) && !/(: | #|:$)/.test(value);

// The inverse of `skillObject`: the frontmatter, then the body after the closing line's break. The
// skill's name is its key, which `skillObject` maps back to the same key.
export function skillFile(draft: Draft, key: string): string {
  const where = objectPath(`skill:${key}`);
  const body = draft.take(`skill:${key}`);
  only(body, ["description", "body"], where);
  if (typeof body.description !== "string" || !PLAIN_VALUE(body.description)) {
    unsupported(where, "/description", `a description a SKILL.md frontmatter line cannot hold: ${shown(body.description)}`);
  }
  if (typeof body.body !== "string") unsupported(where, "/body", "a skill's body is text");
  return `---\nname: ${key}\ndescription: ${body.description}\n---\n${body.body}`;
}

// The inverse of `dashboardObject`.
export function dashboardSource(draft: Draft, key: string): Json {
  const where = objectPath(`dashboard:${key}`);
  const body = draft.take(`dashboard:${key}`);
  only(body, ["name", "description", "tiles"], where);
  const source: Json = { key, name: body.name };
  if ("description" in body) source.description = body.description;
  source.tiles = unsentinel(body.tiles, where, "/tiles", { entity_id: entityTarget });
  return source;
}
