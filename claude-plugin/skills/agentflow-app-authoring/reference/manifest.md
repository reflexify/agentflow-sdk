# `config/package-manifest.json`

The package's identity, what it needs from the organization, and its parameters. The builder copies these
members into `package/manifest.json` in the platform's order, and adds four of its own.

## The members

Required: `configVersion`, `formatVersion`, `id`, `version`, `name`, `summary`, `publisher`, `license`,
`dataHandling`, `changelog`, `contentLocale`, `minPlatformVersion`, `requires`, `parameters`, `audience`,
`ceiling`, `egress`, `mcp`, `tests`. Optional: `ui` and `launcher`.

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

## Member by member

- **`configVersion`**: `1`, first in the file. It is the version of the `config/` format, not of your
  package. The builder refuses a file without it (`CONFIG_VERSION_MISSING`) or with one newer than it reads
  (`CONFIG_VERSION_UNKNOWN: … 2 is newer than this SDK (0.2.0 reads up to 1); install a newer SDK release`).
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
  the data; the support desk lists its model provider and Resend).
- **`contentLocale`**: the language the package's own text is written in, such as `en`.
- **`minPlatformVersion`**: `2026.10`, as the examples carry.
- **`requires`**:
  - `platformCapabilities`: `[]`.
  - `entities`: the platform entities the package uses, each `{ "key", "access": "read", "fields": {} }`.
    List `user` when a field refers to people, and `org_unit` when a field refers to units or work is
    assigned to units. `lint` reports an entity that is used and not listed, and one that is listed and not
    used (`requirement_undeclared`, `requirement_unused`).
  - `permissions`: for each group parameter whose members **sign in and use the app**, the coarse permissions
    they need: `{ "group": "@param:…", "permissions": ["entity.read", "entity.list", "entity.write"] }`. Add
    `entity.delete` if they delete records (Projects does). A role does not come from a group, so say in the
    parameter's `help` that its members need a role with these permissions. This is a **check, never a grant**:
    setup warns about the people in the group who lack a permission, and nothing more. Only people are read, so
    it says nothing about a service principal. **Do not list the automation group**: its one account never signs in
    and would be warned about for nothing. The principal's role (`entity.read`, `entity.list`, `entity.write`
    as its steps need) goes in the principal parameter's `help`.
- **`parameters`**: a list of `{ "key", "type", "required", "label", "help" }`, and for a `number`, `text` or
  `enum` parameter also `default`, and `options` (a list of strings) for an `enum` (below).
- **`audience`**: `"@param:<group parameter>"`, the group of people who use the app.
- **`egress`**: the hosts the package's workflows call, each `{ "host", "purpose" }`. `[]` for none. The
  support desk lists `api.resend.com`.
- **`ceiling`**: `{ "narrow": {} }`, as every example has it.
- **`mcp`**: `{ "enabled": false }`.
- **`tests`**: `[]`.
- **`ui`**: only when the package ships a UI module: `{ "kind": "module", "entry": "ui/index.js",
  "contract": 1 }`. Then `pnpm build` builds the module into `package/ui` with Vite (the starter's
  `vite.module.config.ts`). Leave it out, and every `module` launcher entry, when there is no module.
- **`launcher`**: see `dashboards-and-launcher.md`.

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

- **The audience group**: everyone who uses the app (`app_users` in the case desk).
- **One group per role** that needs organization-wide access, such as creators or admins. There is no admin
  bypass: an admin reaches records only through a grant (Projects has `project_creators` and
  `project_admins`).
- **For workflows a trigger starts** (nobody starts them by hand): a `service_principal_ref` they run as, and a
  `group_ref` that holds it, so rules, movers and grants can let the workflow's writes through (Projects has
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
