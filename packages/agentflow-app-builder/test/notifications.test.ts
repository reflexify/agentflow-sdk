import { describe, expect, it } from "vitest";
import { notificationsOf } from "../src/notifications.js";

const W = "package-manifest.json";

const kind = (key: string): Record<string, unknown> => ({
  key,
  label: { vi: "Task được mở lại", en: "Task reopened" },
  title: { vi: "{actor} đã mở lại {record}", en: "{actor} reopened {record}" },
  body: { vi: "Trong {app}", en: "In {app}" },
  open: "/t/{{ record_id }}",
});

const base = (): { kinds: Record<string, any>[] } => ({
  kinds: [kind("task_reopened"), { ...kind("task_closed"), default_channels: ["email"] }],
});

describe("notificationsOf", () => {
  it("keeps a valid member as written", () => {
    const source = base();
    expect(notificationsOf(source, true)).toEqual(source);
    expect(notificationsOf({ kinds: [{ key: "one", label: "One", title: "{record}", body: "{{literal}} and a lone } stays" }] }, false)).toEqual({
      kinds: [{ key: "one", label: "One", title: "{record}", body: "{{literal}} and a lone } stays" }],
    });
  });

  it("refuses what AgentFlow would, naming the pointer", () => {
    const edit = (change: (m: ReturnType<typeof base>) => void): ReturnType<typeof base> => {
      const member = base();
      change(member);
      return member;
    };
    const rows: [string, ReturnType<typeof base>, boolean, string][] = [
      ["51 kinds", { kinds: Array.from({ length: 51 }, (_, i) => kind(`k${i}`)) }, true, "/notifications/kinds"],
      ["a duplicate key", edit((m) => (m.kinds[1]!.key = "task_reopened")), true, "/notifications/kinds/1/key"],
      ["a key with a double underscore", edit((m) => (m.kinds[1]!.key = "task__closed")), true, "/notifications/kinds/1/key"],
      ["a key that is no key", edit((m) => (m.kinds[1]!.key = "Task-Closed")), true, "/notifications/kinds/1/key"],
      ["a 61-character label", edit((m) => (m.kinds[0]!.label.en = "a".repeat(61))), true, "/notifications/kinds/0/label/en"],
      ["an empty title", edit((m) => (m.kinds[0]!.title.en = "")), true, "/notifications/kinds/0/title/en"],
      ["a blank title", edit((m) => (m.kinds[0]!.title.en = "   ")), true, "/notifications/kinds/0/title/en"],
      ["a 121-character title", edit((m) => (m.kinds[0]!.title.en = "a".repeat(121))), true, "/notifications/kinds/0/title/en"],
      ["a 501-character body", edit((m) => (m.kinds[0]!.body.en = "a".repeat(501))), true, "/notifications/kinds/0/body/en"],
      ["an unknown placeholder", edit((m) => (m.kinds[0]!.title.en = "{owner} reopened it")), true, "/notifications/kinds/0/title/en"],
      ["an unclosed placeholder", edit((m) => (m.kinds[0]!.body.en = "{record")), true, "/notifications/kinds/0/body/en"],
      [
        "a title whose languages differ from the label's",
        edit((m) => (m.kinds[0]!.title = { vi: "{record}", fr: "{record}" })),
        true,
        "/notifications/kinds/0/title",
      ],
      [
        "an invalid language tag",
        edit((m) => {
          m.kinds[0]!.label = { VI: "Mở lại", en: "Reopened" };
          m.kinds[0]!.title = { VI: "{record}", en: "{record}" };
        }),
        true,
        "/notifications/kinds/0/label/VI",
      ],
      ["an empty language map", edit((m) => (m.kinds[0]!.label = {})), true, "/notifications/kinds/0/label"],
      ["a label that is neither text nor a map", edit((m) => (m.kinds[0]!.label = 7)), true, "/notifications/kinds/0/label"],
      ["an open page without a module", base(), false, "/notifications/kinds/0/open"],
      ["an open page that leaves the module", edit((m) => (m.kinds[0]!.open = "//x")), true, "/notifications/kinds/0/open"],
      ["an open page with the placeholder twice", edit((m) => (m.kinds[0]!.open = "/{{ record_id }}/{{ record_id }}")), true, "/notifications/kinds/0/open"],
      ["in_app as a default channel", edit((m) => (m.kinds[1]!.default_channels = ["in_app"])), true, "/notifications/kinds/1/default_channels/0"],
      ["an unknown default channel", edit((m) => (m.kinds[1]!.default_channels = ["sms"])), true, "/notifications/kinds/1/default_channels/0"],
      ["a repeated default channel", edit((m) => (m.kinds[1]!.default_channels = ["email", "email"])), true, "/notifications/kinds/1/default_channels/1"],
      ["a member the builder has no rule for", edit((m) => (m.kinds[0]!.icon = "bell")), true, "/notifications/kinds/0/icon"],
      ["a missing title", edit((m) => delete m.kinds[0]!.title), true, "/notifications/kinds/0/title"],
    ];
    for (const [name, member, hasUi, pointer] of rows) {
      expect(() => notificationsOf(member, hasUi), name).toThrow(`${W}#${pointer}:`);
    }
    expect(() => notificationsOf({}, true)).toThrow(`${W}#/notifications/kinds:`);
    expect(() => notificationsOf([], true)).toThrow(`${W}#/notifications:`);
  });
});
