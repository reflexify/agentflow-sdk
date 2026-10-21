# Agents and skills

An agent is an AI worker a workflow step calls. A skill is a Markdown document an agent loads when it needs
it. The support desk is the worked example: two agents (`config/agents/support.json`,
`config/agents/triage.json`) and three skills (`config/skills/refunds.SKILL.md`,
`config/skills/invoices.SKILL.md`, `config/skills/account_access.SKILL.md`).

## An agent: `config/agents/<key>.json`

`key` equals the file name. The other members are carried to the `agent:<key>` object with references
translated: `name`, `description`, `profile` and `access`.

- `profile.systemPrompt`: the agent's instructions.
- `profile.skills`: the skills it may load, each `{ "skillId": "${skill:<name>}", "activation": "on_demand" }`.
- `profile.model`: the model, as a `${param:…}` of type `text`, so each organization chooses its own.
- `access`: `{ "mode": "restricted", "groups": ["${param:<group_ref>}"] }`, the groups that may use the agent;
  restricted access names at least one group, and `{ "mode": "everyone" }` names none.
- The parameters that hold the agent's `model` (type `text`) and its access groups (type `group_ref`) must be
  `"required": true`, or `lint` reports `agent_parameter_optional`. A literal model or group id is refused
  (`slot_not_parameter`).
- `name` and `description` carry no space at either end. A package's agent has no MCP servers or knowledge
  documents (`agent_profile_mcp`, `agent_profile_knowledge`): the organization attaches its own after installing.
  An agent step may not carry its own tools, MCP servers or knowledge either, and names its agent only as
  `{ "agentId": "${agent:<key>}" }` (`agent_ref_not_sentinel`).

The support desk's drafting agent, with its prompt shortened:

```json
{
  "key": "support",
  "name": "Support agent",
  "description": "Drafts every reply to a customer.",
  "profile": {
    "systemPrompt": "You write replies to customers on behalf of our support team. …",
    "skills": [
      { "skillId": "${skill:refunds}", "activation": "on_demand" },
      { "skillId": "${skill:invoices}", "activation": "on_demand" },
      { "skillId": "${skill:account-access}", "activation": "on_demand" }
    ],
    "model": "${param:support_model}"
  },
  "access": { "mode": "restricted", "groups": ["${param:support_group_id}"] }
}
```

A workflow calls an agent with an `agent` step (the support desk's `config/build/draft.mjs`):

```js
node("triage", "Triage", "agent", {
  agentRef: { agentId: "${agent:triage}" },
  conversation: { thread: "{{ subject.record_id }}", window: 10 },
  promptTemplate: "",
  outputSchema: { type: "object", properties: { intent: { type: "string" }, confidence: { type: "number" } } },
}),
```

(Abridged: the real `outputSchema` lists every label the triage agent returns.)

`outputSchema` is the JSON Schema of what the agent returns, read by later steps as
`nodes.<id>.output.<member>`.

## A skill: `config/skills/<file>.SKILL.md`

The file is read the way the installer reads it: a frontmatter between the first two `---` lines, then the
body, kept exactly.

```
---
name: account-access
description: How to answer a customer who cannot log in or reach their account, and what you must never ask for or confirm.
---

# Login and account access
```

- The frontmatter holds exactly `name` and `description`, each a plain `name: value` line: no quotes, no
  YAML syntax, and no `: ` or ` #` inside the value.
- The file is named for the skill with each `-` in `name` written `_`: `name: account-access` is
  `account_access.SKILL.md`, the object `skill:account_access`.
- References use the name as written: `${skill:account-access}`. A skill name is the only key that may hold a
  hyphen.
- Write the description so the agent knows when to load it: what the customer asks, and what the skill
  settles.

## The refusals you will meet

```
BUILD_REFUSED: skills#: notes.txt is not a .SKILL.md file
BUILD_REFUSED: skills/account-access.SKILL.md#: is named for account-access, so it must be account_access.SKILL.md
BUILD_REFUSED: skills/account_access.SKILL.md#: frontmatter line is not a plain "name: value" or "description: value": description: "How."
BUILD_REFUSED: objects/agent/a.json#/profile/skills/0/skillId: @obj:skill:account_acess names no object, parameter or required entity of the package
```

- Only `.SKILL.md` files go in `config/skills/`.
- Rename the file for its `name`, with `_` for each `-`.
- Write each frontmatter line plain, with no quotes, and only `name` and `description`.
- A reference that names nothing is reported against the built object (`objects/agent/<key>.json`); fix it at the
  same pointer in `config/agents/<key>.json`. Check the spelling, and the `-` and `_` rule.
