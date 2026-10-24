import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { skillObject } from "../src/assets.js";

function refusal(front: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "skill-frontmatter-"));
  fs.mkdirSync(path.join(dir, "skills"));
  fs.writeFileSync(path.join(dir, "skills", "my_bookings.SKILL.md"), `---\nname: my-bookings\n${front}\n---\n\nBody\n`);
  try {
    skillObject(dir, "my_bookings.SKILL.md");
  } catch (error) {
    return (error as Error).message;
  }
  throw new Error("expected a refusal");
}

describe("a skill's frontmatter refusal says which rule broke", () => {
  it.each([
    ['description: Answers what I booked: rooms, dates', 'holds ": "', "new key"],
    ['description: Answers "what have I booked" in the rooms app', null, null],
    ['description: "How."', "starts with a quote", "begin the value with a plain word"],
    ["description: [a, b]", 'starts with "["', "YAML syntax"],
    ["description: Rooms # not a comment", 'holds " #"', "comment"],
    ["description: Rooms for:", 'ends with ":"', "full stop"],
    ["title: Rooms", 'start with "name: " or "description: "', "only these two"],
  ])("%s", (line, rule, hint) => {
    if (rule === null) {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "skill-frontmatter-"));
      fs.mkdirSync(path.join(dir, "skills"));
      fs.writeFileSync(path.join(dir, "skills", "my_bookings.SKILL.md"), `---\nname: my-bookings\n${line}\n---\n\nBody\n`);
      expect(skillObject(dir, "my_bookings.SKILL.md")[0]).toBe("skill:my_bookings");
      return;
    }
    const message = refusal(line);
    expect(message).toContain('is not a plain "name: value" or "description: value"');
    expect(message).toContain(rule);
    expect(message.toLowerCase()).toContain(hint!.toLowerCase());
    expect(message).toContain(line.slice(0, 20));
  });
});
