import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const here = path.dirname(new URL(import.meta.url).pathname);
const roots = [path.join(here, "../src"), path.join(here, "../../agentflow-sdk/src")];

function sources(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? sources(full) : /\.(ts|mjs)$/.test(entry.name) ? [full] : [];
  });
}

// A project has `agentflow-app` as a dependency, not on its PATH: its scripts (`pnpm build`, `pnpm seal`) and
// `pnpm exec agentflow-app <command>` run it. A message that tells the reader to run the bare name sends them to
// "command not found".
describe("hints in messages", () => {
  it("name a command a project can run, never the bare agentflow-app", () => {
    const bare = /(?:\b(?:run|with|check|then|or|as) |')agentflow-app /;
    const found = roots.flatMap(sources).flatMap((file) =>
      fs.readFileSync(file, "utf8").split("\n").flatMap((line, n) => (bare.test(line) ? [`${path.basename(file)}:${n + 1}: ${line.trim()}`] : [])),
    );
    expect(found).toEqual([]);
  });
});
