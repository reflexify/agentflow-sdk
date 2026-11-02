import { afterEach, describe, expect, it } from "vitest";
import { Platform } from "../src/platform.js";
import { writeStoredZip } from "../src/seal/zip.js";
import { archiveSigningWarnings, packageSigningMethods, signingWarnings } from "../src/signing-check.js";
import { closeStubs, envFor, stub } from "./http-stub.js";

afterEach(closeStubs);

const workflowFile = (nodes: unknown[]): Buffer => Buffer.from(JSON.stringify({ name: "w", start: "start", nodes }));
const sign = (id: string, signingMethod?: string) => ({
  id,
  node_type: "signature",
  parameters: { id, ...(signingMethod ? { signingMethod } : {}) },
});

const signingPackage = new Map<string, Buffer>([
  [
    "objects/workflow/a.json",
    workflowFile([
      { id: "loop", node_type: "for_each", parameters: { body: { nodes: [sign("in_loop", "client_cert")] } } },
      { id: "review", node_type: "human", parameters: { signing: { documents: [] } } },
      { id: "plain", node_type: "human", parameters: { signing: null } },
    ]),
  ],
  ["objects/entity/e.json", workflowFile([sign("elsewhere", "other_method")])],
]);

describe("packageSigningMethods", () => {
  it("finds a method at any loop depth, defaults a Human step's to server_email, and reads only workflows", () => {
    expect(packageSigningMethods(signingPackage)).toEqual(new Set(["client_cert", "server_email"]));
  });

  it("counts a Human step whose signing is null as using none", () => {
    const files = new Map([["objects/workflow/a.json", workflowFile([{ id: "plain", node_type: "human", parameters: { signing: null } }])]]);
    expect(packageSigningMethods(files)).toEqual(new Set());
  });
});

describe("signingWarnings", () => {
  const OFFERS_NONE =
    "warning: this package signs, but the deployment does not offer signing (its eSign service is not configured), so its setup will refuse to install the package";
  const LACKS_CERT =
    "warning: this package signs with client_cert, which the deployment does not offer (it offers server_email), so its setup will refuse to install the package";

  it.each([
    ["no esign member", {}, []],
    ["no methods", { esign: { methods: [] } }, [OFFERS_NONE]],
    ["server_email only", { esign: { methods: ["server_email"] } }, [LACKS_CERT]],
    ["both", { esign: { methods: ["server_email", "client_cert"] } }, []],
    ["only entries that are not names", { esign: { methods: [1, null] } }, [OFFERS_NONE]],
    ["a name beside entries that are not names", { esign: { methods: ["server_email", 7] } }, [LACKS_CERT]],
  ])("answers %s", async (_name, answer, lines) => {
    const server = await stub(() => ({ status: 200, json: { platform_version: "2026.11", format_versions: [1], ...answer } }));
    const platform = Platform.configure(envFor(server.url), undefined);
    expect(await signingWarnings(platform, signingPackage)).toEqual(lines);
    expect(server.seen.map((r) => `${r.method} ${r.path}`)).toEqual(["GET /api/v1/platform"]);
  });

  it("asks nothing of a package that does not sign", async () => {
    const server = await stub(() => ({ status: 500, html: "" }));
    const platform = Platform.configure(envFor(server.url), undefined);
    expect(await signingWarnings(platform, new Map([["objects/workflow/a.json", workflowFile([])]]))).toEqual([]);
    expect(server.seen).toEqual([]);
  });
});

describe("archiveSigningWarnings", () => {
  it.each([
    ["bytes that are not an archive", () => Buffer.from("not a zip")],
    ["a workflow nested too deep to walk", () => writeStoredZip([["objects/workflow/a.json", Buffer.from(`{"nodes":${"[".repeat(50_000)}${"]".repeat(50_000)}}`)]])],
  ])("warns of nothing for %s, and asks nothing of the deployment", async (_name, make) => {
    const server = await stub(() => ({ status: 500, html: "" }));
    const platform = Platform.configure(envFor(server.url), undefined);
    expect(await archiveSigningWarnings(platform, make())).toEqual([]);
    expect(server.seen).toEqual([]);
  });
});
