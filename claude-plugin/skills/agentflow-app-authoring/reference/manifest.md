# `config/package-manifest.json`

The package's identity, what it needs from the organization, and its parameters. The builder copies these
members into `package/manifest.json` in the platform's order, and adds four of its own.

## The members

Required: `configVersion`, `formatVersion`, `id`, `version`, `name`, `summary`, `publisher`, `license`,
`dataHandling`, `changelog`, `contentLocale`, `minPlatformVersion`, `requires`, `parameters`, `audience`,
`ceiling`, `egress`, `mcp`, `tests`. Optional: `ui`, `launcher` and `assistant`.

- A missing member is refused: `package-manifest.json#/mcp: missing`.
- Four members are generated: `exports`, `features`, `objects`, `grants`. Writing one is refused with
  `a member the builder does not take from here`.
- The builder checks that the members are there and that each sentinel in them resolves. It does not check
  what they hold: copy the shapes below.
- This file is not translated, except `launcher`. Write sentinels directly: `"@param:app_users"`.

The case desk's manifest, whole (`config/package-manifest.json` in the starter):

```json config
{
  "configVersion": 1,
  "formatVersion": 1,
  "id": "acme/case-desk",
  "version": "0.1.0",
  "name": "Case desk",
  "summary": "Open a case, review it, and approve or reject it.",
  "publisher": { "name": "Acme", "contact": "apps@acme.example", "support": "https://acme.example/support" },
  "license": "Proprietary",
  "dataHandling": {
    "purpose": "Recording cases and their review",
    "storage": "In the organization's AgentFlow",
    "retention": "As long as the organization keeps its cases",
    "privacy": "https://acme.example/privacy",
    "recipients": []
  },
  "changelog": "First release: the Case entity, the Open a case workflow and the Cases screen.",
  "contentLocale": "en",
  "minPlatformVersion": "2026.10",
  "requires": {
    "platformCapabilities": [],
    "entities": [{ "key": "user", "access": "read", "fields": {} }],
    "permissions": [
      { "group": "@param:app_users", "permissions": ["entity.read", "entity.list", "entity.write"] }
    ]
  },
  "parameters": [
    { "key": "app_users", "type": "group_ref", "required": true, "label": "Case desk users",
      "help": "Everyone who opens, reviews and reads cases. Give its members a role with entity.read, entity.list and entity.write: a role does not come from a group." }
  ],
  "audience": "@param:app_users",
  "egress": [],
  "ceiling": { "narrow": {} },
  "mcp": { "enabled": false },
  "ui": { "kind": "module", "entry": "ui/index.js", "contract": 1 },
  "launcher": {
    "entries": [
      { "key": "cases", "label": { "en": "Cases", "vi": "Hồ sơ" }, "icon": "inbox", "target": { "module": "/" } }
    ]
  },
  "tests": []
}
```

`init` keeps the starter's text in `summary`, `dataHandling` (`purpose`, `retention`, `privacy`), `publisher`
and `changelog`. Rewrite all of them for your app: the admin reads them on the setup page.

## Member by member

- **`configVersion`**: `1`, first in the file. It is the version of the `config/` format, not of your
  package. The builder refuses a file without it (`CONFIG_VERSION_MISSING`) or with one newer than it reads
  (`CONFIG_VERSION_UNKNOWN: … 2 is newer than this SDK (0.4.1 reads up to 1); install a newer SDK release`).
- **`formatVersion`**: `1`, the version of the package format.
- **`id`**: `<prefix>/<key>`. The prefix is your package prefix: you choose it. It is 2 to 16
  lowercase letters and digits, starting with a letter. The key is 1 to 40 lowercase letters, digits and
  hyphens, starting with a letter, with no double or trailing hyphen.
- **`version`**: SemVer 2.0 (`1.0.0`). Raise it for every release you seal: `seal` refuses to replace an
  `.afpkg` of the same version that holds other contents (`SEAL_OUT_EXISTS`).
- **`name`**, **`summary`**, **`changelog`**: text the installer reads. Write `changelog` for each release.
- **`publisher`**: `name`, `contact`, `support`.
- **`license`**: a string, such as `Proprietary`.
- **`dataHandling`**: `purpose`, `storage`, `retention`, `privacy` (a URL) and `recipients` (who else receives
  the data, such as a model provider and an email service the app's workflows use).
- **`contentLocale`**: the language the package's own text is written in, such as `en`.
- **`minPlatformVersion`**: `2026.10`, as the starter carries it.
- **`requires`**:
  - `platformCapabilities`: `[]`.
  - `entities`: the platform entities the package uses, each `{ "key", "access": "read", "fields": {} }`.
    List `user` when a field refers to people, and `org_unit` when a field refers to units or work is
    assigned to units. `lint` reports an entity that is used and not listed, and one that is listed and not
    used (`requirement_undeclared`, `requirement_unused`).
    - **What the admin sees.** Each listed entity is a row on the setup page, `Entity <key>` (`Entity user`), with the
      hint `An entity user of your organization`, followed by `with the fields name (text), email (text)` when you
      list fields. It is a binding with an optional picker, not a question: with nothing picked, `user` resolves to
      the built-in Users entity (its key is `user`), and the row is satisfied. Say so in the admin message when
      the admin may wonder (`admin-message.md` in the release skill).
    - **`fields` decides what the app is told about people.** Under the app's ceiling (the app's own token, as a
      standalone site calls) a person's name is told only while `user` is listed with `name`, and the email only
      with `email`; with `fields: {}` a label beside a record, a task's assignee, a comment's author and the `@`
      menu come back empty or refused. List `{ "name": "text" }` for any screen that shows people by name, and
      `"email": "text"` when it shows or searches by address (a module embedded in AgentFlow calls as the person
      and is not cut; `pitfalls.md`). Setup also checks that the organization's entity has each field you list, at
      that type (a miss is a blocked row, `APP_REQUIRED_OBJECT_INCOMPATIBLE`): `name` and `email`, both `text`, so
      list them at those types.
  - `permissions`: for each group parameter whose members **sign in and use the app**, the coarse permissions
    they need: `{ "group": "@param:…", "permissions": ["entity.read", "entity.list", "entity.write"] }`. Add
    `entity.delete` if they delete records. A role does not come from a group, so say in the
    parameter's `help` that its members need a role with these permissions. This is a **check, never a grant**:
    setup warns about the people in the group who lack a permission, and nothing more. Only people are read, so
    it says nothing about a service principal. **Nothing compares the list with the grants**: not the builder (it
    checks the shape: a declared `group_ref` parameter, each named once, permission slugs), not `lint` (it has no
    rule on `requires.permissions`), not setup (it reads the roles of the group's people, never the grants). A group with a grant
    that is not listed here, or a listed group whose grants do not need what you listed, is silent. Keep the two in
    step yourself: list `entity.delete` for a group whose grants delete, and list a group only when its members
    sign in. A group with no grant still belongs here when its members sign in. **Do not list the automation group**: its one account never signs in
    and would be warned about for nothing. The principal's role (`entity.read`, `entity.list`, `entity.write`
    as its steps need) goes in the principal parameter's `help`.
- **`parameters`**: a list of `{ "key", "type", "required", "label", "help" }`, and for a `number`, `text` or
  `enum` parameter also `default`, and `options` (a list of strings) for an `enum` (below).
- **`audience`**: `"@param:<group parameter>"`, the one group of people the app is for. It decides three things and
  grants nothing: whether the app and its entries are listed in a person's sidebar, whether its module opens for
  them (otherwise AgentFlow says they are not assigned), and whether a call made with the app's own token, by
  a standalone site that signed them in, is admitted (`403 APP_NOT_ASSIGNED`). What a person can read or write
  is decided by the grants, so someone in the audience without a grant opens an app with no records in it.
  **The reverse is silent too: a group that holds grants but whose members are not in the audience gets no app
  entry in the sidebar and no module** ("not assigned"), though the grants are there. `lint` does not warn about
  it: it has no rule that compares the audience with the groups that hold grants. The only warning is on the
  admin's setup page, at install time: each group parameter's item says `members_outside_audience` (a count and up to
  20 names) for the chosen group's active people who are not in the audience group. It never blocks, and it sees
  the groups the admin chose, not your design, so check the design yourself, group by group, and say in each group's
  `help` that its members must also be in the audience group. The exception is the automation group: its dedicated
  account is not a user and is never in the audience, so setup's `members_outside_audience` on it is harmless.
  Membership is direct: a group does not contain other groups, so a lab manager is in the audience only when
  they are a member of the audience group itself. With several role groups, choose one of two shapes:
  - **A group of its own** (here `app_users`; in the starter that name is both the audience and the holder of the
    grants, so this shape adds a separate group beside the role groups) that carries no grant. List it in
    `requires.permissions` with the permissions every user needs (`entity.read`, `entity.list`, `entity.write`):
    it is the one group that holds them all, and setup checks the roles of its members, not grants. It holds
    everyone who uses the app, whatever role groups they are also in. The admin puts each person in it as well
    as in their role group; say so in the `help` of every role group. A group with no grant cannot collide with
    the others (below).
  - **One of the role groups**, the one every user belongs to (for example Staff, when managers are also
    staff). Then every other role group's `help` must say its members are in that one too: a person in only
    the other group does not see the app.

  **An app for the whole organization.** The audience is still one group: a packaged app cannot be open to
  everyone. Make the audience parameter's `help` say "a group that holds everyone in the organization who uses
  the app (all staff)". Give the records to `{ "kind": "everyone" }` grants (`access.md`). Someone outside that
  group still holds the Everyone grant and reaches the records in AgentFlow's own pages, but sees no app entry
  and no module.
- **`egress`**: the hosts the package's workflows call, each `{ "host", "purpose" }`. `[]` for none. A
  package whose workflows send email through Resend lists `api.resend.com`.
- **`ceiling`**: `{ "narrow": {} }`, as the starter has it.
- **`mcp`**: `{ "enabled": false }`.
- **`tests`**: `[]`.
- **`ui`**: only when the package ships a UI module: `{ "kind": "module", "entry": "ui/index.js",
  "contract": 1 }`, as the case desk has it, or `"contract": 2` for a module that calls `host.assistant`. Then `pnpm build` builds the module into `package/ui` with Vite (the starter's
  `vite.module.config.ts`). `contract` is the host contract the module was written for, not the contract version
  of any object: 1 or 2. Declare 2 when the module calls `host.assistant` (it tells the assistant which record is
  open). **No platform version and no route tells a build that reads contract 2 from one that does not yet**:
  both report platform `2026.10`, so leave `minPlatformVersion` at the month the package already needs. An
  AgentFlow built before contract 2 refuses the package at `lint` and at upload, as `manifest_invalid` at
  `manifest.json` (it does not say `platform_too_old` and does not name `ui.contract`). Contract 2 is in no
  tagged AgentFlow release yet. To find out whether a deployment knows it, run `lint` with `"contract": 2` and then
  with `"contract": 1`: if only 1 passes, the deployment predates contract 2, so declare 1. An installed version cannot be replaced by a lower one, so once
  an organization has installed a contract-2 package it cannot go back to an AgentFlow that knows only contract 1. Leave it out, and every `module` launcher entry, when there is no module.
- **`launcher`**: see `dashboards-and-launcher.md`.
- **`assistant`**: only when the package wants a different card lifetime. `{ "proposal_ttl_minutes": 15 }`
  is the longest, in minutes (a whole number from 1 to 1440), that a confirmation card for one of the app's
  records stays pressable. A card touching records of several apps takes the shortest lifetime among them.
  An upgrade changes new cards only. Older AgentFlow versions refuse the member, so set `minPlatformVersion`
  to the release that reads it. `labels` names your entities and their fields for the assistant's cards in
  other languages: `{ "vi": { "task": { "name": "Công việc", "fields": { "due": "Hạn" } } } }`, a locale, then
  an entity's local key, then its `name` and a label per field key (1 to 80 characters). The builder refuses
  an entity or a field the package does not build. A person whose language the package names its records in
  sees those names on a card, a regional tag such as `vi-VN` falls back to `vi`, and any name left out keeps
  the entity's own. Cards are the only place they appear today: the record pages keep the entity's names.
  `skills` lists the package's own skills the organization's assistant should be able to load, by key
  (`"skills": ["create_team"]`, the name of a `.SKILL.md` file in the config's `skills` folder without its
  extension, distinct, at most 32). On install each is added to the assistant as an on-demand skill; a skill you leave out
  stays with your own agents. Write each description for the assistant, not for a package agent: what the
  person asks, and what the skill settles (see `agents-and-skills.md`). An admin can take a skill off the
  assistant, and an upgrade respects that. The builder refuses a key with no skill file.

## Parameters

A parameter is anything that differs per organization. The installer fills them in. Its `type` tells the
builder where it may be used; a parameter used for the wrong purpose is refused (`ghost is not a group_ref
parameter`).

| `type` | Holds | Used by |
|---|---|---|
| `group_ref` | a group | a grant's `principal.id`, a workflow's `restricted(...)`, an `in_group` test, a group assignee, `audience`, `requires.permissions` |
| `user_ref` | a person | a `user` assignee |
| `unit_ref` | a unit | a `unit` assignee's `anchor.unit_id` |
| `service_principal_ref` | a service principal | a workflow's `servicePrincipal(...)` run-as |
| `connection_ref` | a connected account, such as Resend | an email step's connection, a `connected_app` trigger |
| `secret_ref` | a stored secret | a webhook step's `auth.secretId` |
| `sla_policy_ref` | an SLA policy | a deadline clock's `sla_policy` |
| `escalation_policy_ref` | an escalation policy | a deadline clock's `escalation_policy` |
| `text` | a string | values read by `readParameters`, an agent's model, a schedule's timezone |
| `number`, `enum` | a number; one of `options` | values read by `readParameters` |

A parameter that holds an agent's model or access group must be `required: true` (`lint`:
`agent_parameter_optional`). The values an admin gives each type, and where to find an id, are in the release
skill ("The parameters file"). A parameter you leave out of `parameters.json` is answered by the admin on the
setup page.

Choose them this way:

- **The audience group**: everyone who uses the app (`app_users` in the case desk). With several role groups, see `audience` above.
- **One group per role** that needs organization-wide access, such as creators or admins. There is no admin
  bypass: an admin reaches records only through a grant.
- **For workflows a trigger starts** (nobody starts them by hand): a `service_principal_ref` they run as, and a
  `group_ref` that holds it, so rules, movers and grants can let the workflow's writes through (`workflows.md` names them
  `automation_principal` and `automation_group`). Workflows people start run as the person and need neither
  (`workflows.md`, "Who a workflow runs as"). Setup counts only people as a group's members, so say in the group's `help` that it
  holds the service principal and one dedicated account that never signs in, and no one else.
- Write each `help` for the installer: what to choose, and the role its members need.
- Two group parameters that each carry a grant on the same entity must be answered with different groups: the
  setup page refuses one group for both (`APP_GRANT_RECIPIENT_COLLISION`). Say so in each one's `help`, naming the
  other, and that members may overlap (`pitfalls.md`, Access).

## What the builder adds

- `objects`: every object the build makes, as `{ key, kind }`: each entity with its fields, views and form
  (in `entityOrder`, else sorted), then skills, agents, workflows (in `ORDER`), triggers, actions, dashboards.
- `grants`: the entities' grants, then each workflow's start grants.
- `exports`: `[]`. `features`: `{}`.
