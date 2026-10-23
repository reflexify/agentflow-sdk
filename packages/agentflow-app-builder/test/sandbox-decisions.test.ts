import { describe, expect, it } from "vitest";
import { sandboxDecisions } from "../src/sandbox/decisions.js";

const plan = {
  setup: {
    features: [
      { package: "acme/desk", key: "extras", optional: true, on: false },
      { package: "acme/desk", key: "core", optional: false, on: true },
      { package: "acme/desk", key: "beta", optional: true, on: false },
    ],
  },
  document: { installations: [{ package_id: "acme/desk", clients: [{ logical_key: "client:portal" }, { logical_key: "client:admin" }] }] },
};

describe("sandboxDecisions", () => {
  it("turns every optional feature on and approves every client when nothing is given", () => {
    expect(sandboxDecisions({}, plan)).toEqual({
      features: { "acme/desk": ["beta", "extras"] },
      approved_clients: { "acme/desk": ["client:admin", "client:portal"] },
    });
  });

  it("keeps a member the file gives, even an empty one, and fills only the other", () => {
    const given = { features: { "acme/desk": [] }, grants: { "acme/desk": { notify: "declined" } } };
    expect(sandboxDecisions(given, plan)).toEqual({
      features: { "acme/desk": [] },
      approved_clients: { "acme/desk": ["client:admin", "client:portal"] },
      grants: { "acme/desk": { notify: "declined" } },
    });
  });

  it("adds nothing for a package with no optional features or clients, and tolerates a malformed plan", () => {
    expect(sandboxDecisions({}, { setup: { features: [{ package: "a/b", key: "core", optional: false }] }, document: { installations: [{ package_id: "a/b", clients: [] }] } })).toEqual({});
    expect(sandboxDecisions({ grants: {} }, { setup: "nonsense" })).toEqual({ grants: {} });
  });
});
