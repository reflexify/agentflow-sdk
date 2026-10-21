import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defineApp, loadApp } from "../src/app.js";
import { CliError } from "../src/errors.js";
import { copyApp, fixtureApp, writeApp } from "./app-fixture.js";

const sections = { workflows: {}, order: [], triggers: {}, actions: {} };

const refusal = async (promise: Promise<unknown>): Promise<CliError> => {
  const error = await promise.then(
    () => undefined,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(CliError);
  return error as CliError;
};

describe("loadApp", () => {
  it("reads the app file and points the build at config/", async () => {
    const { app, options, manifestDeclaresUi } = await loadApp(fixtureApp);
    expect(options.configDir).toBe(path.join(fixtureApp, "config"));
    expect(options.entityOrder).toEqual(["note", "contact"]);
    expect(options.exposedSteps).toEqual({ support_handling: ["handle_urgent"] });
    expect(app.entityOrder).toEqual(["note", "contact"]);
    expect(manifestDeclaresUi).toBe(false);
  });

  it("refuses a folder with no app file", async () => {
    const dir = copyApp();
    fs.rmSync(path.join(dir, "agentflow.app.mjs"));
    const error = await refusal(loadApp(dir));
    expect(error.code).toBe("APP_FILE_MISSING");
    expect(error.message).toBe(
      `no agentflow.app.mjs in ${dir}: an app describes its build there (see the builder README, "agentflow.app.mjs")`,
    );
  });

  it("refuses a member defineApp does not take", async () => {
    const dir = copyApp();
    writeApp(dir, `export default { sections: ${JSON.stringify(sections)}, colour: "red" };\n`);
    const error = await refusal(loadApp(dir));
    expect(error.code).toBe("APP_FILE_INVALID");
    expect(error.message).toBe("agentflow.app.mjs: colour is not a member defineApp takes");
  });

  it.each([
    ["no default export", "export const app = {};\n"],
    ["a default export that is not an object", "export default 3;\n"],
    ["a syntax error", "export default {;\n"],
    ["no sections", "export default {};\n"],
    ["a ui naming both a config and a folder", `export default { sections: ${JSON.stringify(sections)}, ui: { viteConfig: "a", prebuilt: "b" } };\n`],
    ["an entityOrder that is not a list", `export default { sections: ${JSON.stringify(sections)}, entityOrder: "note" };\n`],
  ])("refuses an app file with %s", async (_name, text) => {
    const dir = copyApp();
    writeApp(dir, text);
    expect((await refusal(loadApp(dir))).code).toBe("APP_FILE_INVALID");
  });

  it("reads the file again when it changes within one process", async () => {
    const dir = copyApp();
    expect((await loadApp(dir)).options.entityOrder).toEqual(["note", "contact"]);
    writeApp(dir, `export default { sections: ${JSON.stringify(sections)}, entityOrder: ["contact", "note"] };\n`);
    expect((await loadApp(dir)).options.entityOrder).toEqual(["contact", "note"]);
  });
});

describe("defineApp", () => {
  it("returns its argument", () => {
    const app = { sections, entityOrder: ["note"] };
    expect(defineApp(app)).toBe(app);
  });

  it("refuses an unknown member", () => {
    expect(() => defineApp({ sections, colour: "red" } as never)).toThrow("agentflow.app.mjs: colour is not a member defineApp takes");
  });
});
