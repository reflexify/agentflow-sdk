# `sandbox.json`: every member and rule

`sandbox.json` sits at the project's root and is committed. `agentflow-app sandbox check` checks it offline (and, when `package/manifest.json` exists, compares `install.parameters` with the manifest's parameters: an unknown key, a value of the wrong kind, an explicit `null`, and an `@kind:` reference for a `secret_ref` (a sandbox holds no secret) each name the key; a required parameter with no default and no value is a warning, because AgentFlow refuses it only when an enabled object, a grant or the audience uses it, and a refusal when it is a secret, or a connection a sandbox cannot make, that an object uses, whatever value `sandbox.json` gives it ("What a sandbox cannot hold", below). The comparison reads `package/manifest.json` and `package/objects/` as built, so run `pnpm build` first. It also reads each package `dependencies` names and compares `install.decisions.parameters["<its id>"]` with that package's parameters the same way: "Dependencies", below), and AgentFlow checks it again when the sandbox is made. A refusal reads `SANDBOX_SPEC_INVALID`, then `sandbox.json: <field>: <message>` with the wording AgentFlow uses (except for a value of the wrong type, which the CLI words itself, `expected an integer`, `expected a string` or `expected an object`, at the same field), and names the first problem it finds.

```json
{
  "owner": "admin",
  "roles": [
    { "name": "Support", "permissions": ["entity.read", "entity.list", "entity.write"] }
  ],
  "groups": [
    { "key": "support", "name": "Support" },
    { "key": "support_admin", "name": "Support Admin" }
  ],
  "units": [
    { "key": "hq", "name": "Head office" },
    { "key": "support_unit", "name": "Support", "parent": "hq" }
  ],
  "principals": [
    { "key": "automation", "name": "Desk automation", "roles": ["Support"], "groups": ["support"], "owner_eligible": true }
  ],
  "connections": [
    { "key": "mail", "kind": "resend", "secret_env": "SANDBOX_RESEND_API_KEY", "settings": { "from": "desk@example.com" } }
  ],
  "sla_policies": [
    { "key": "reply", "name": "Reply deadlines", "targets": {
      "urgent": { "value": 1, "unit": "business_hours" }, "high": { "value": 4, "unit": "business_hours" },
      "normal": { "value": 1, "unit": "business_days" }, "low": { "value": 3, "unit": "business_days" } } }
  ],
  "settings": { "timezone": "Asia/Ho_Chi_Minh", "locale": "vi" },
  "people": [
    { "handle": "admin", "name": "Sandbox Admin", "roles": ["admin"] },
    { "handle": "agent", "name": "Anna Agent", "roles": ["Support"], "groups": ["support"], "unit": "support_unit" },
    { "handle": "lead", "name": "Lee Lead", "roles": ["Support"], "groups": ["support", "support_admin"] },
    { "handle": "outsider", "name": "Omar Outsider" }
  ],
  "install": {
    "parameters": {
      "support_group_id": "@group:support",
      "run_as": "@principal:automation",
      "mail_connection": "@connection:mail",
      "sla_policy": "@sla_policy:reply"
    },
    "decisions": {}
  }
}
```

Only `people` is required. Any other member left out is empty.

## The cast

- **Keys and handles.** A `handle`, and a `key` of a group, unit, principal or connection, match `[a-z][a-z0-9_]{0,31}` and are unique within their list. A list holds at most 100 entries, and a `name` is 1 to 120 characters.
- **`roles`** on a person or principal names a built-in role (`admin`, `designer`, `viewer`) or a role this file declares. A declared role may hold any permission AgentFlow has except `sandbox.create`, `deployment.admin` and `retention.delete`; the refusal names the role. `sandbox check` does not know AgentFlow's permission names, so a misspelt one passes it and is refused only when the sandbox is made (``roles[0].permissions: `entity.raed` is not a permission``). A declared role may not reuse a built-in role's name.
  - **A person holds only the roles listed.** With no `roles` they hold none, not even `viewer`. So give each person a role that holds what the manifest's `requires.permissions` asks of their group, or they cannot do the app's work: `requires.permissions` is only a check, and nothing grants it for you. Anna in the example holds the `Support` role the file declares, with the three permissions an app that reads, lists and writes records asks for (`entity.read`, `entity.list`, `entity.write`; add `entity.delete` for an app whose people delete records). A role is not a grant on an entity: the app's own grants still decide which records a person reaches.
  - **The built-in roles.** `admin` holds every permission AgentFlow has except four that are opt-in only, `dashboard.manage.any`, `entity.records.restore`, `instance.read.any` and `sandbox.create`, and three a sandbox withholds, `deployment.admin`, `retention.delete` and `app_catalog.publish`. It does hold `integration.admin`, which installs and arms the app. Without `deployment.admin` nobody in a sandbox can manage its users, groups, units, roles, keys, models, MCP servers or settings, even signed in as the owner, so declare everything the app needs in this file. `designer` holds `agent.design`, `entity.delete`, `entity.design`, `entity.list`, `entity.read`, `entity.write`, `form.design`, `workflow.design`, `workflow.publish` and `workflow.simulate`. `viewer` holds no permission at all. Every other permission name, with what it allows, is in the guide's Roles & permissions page, `<AGENTFLOW_URL>/guides/en/bat-dau/vai-tro-quyen` (Vietnamese: `<AGENTFLOW_URL>/guides/bat-dau/vai-tro-quyen`).
- **`owner`** is the handle of a person who holds the built-in `admin` role (default `admin`). The owner approves the install, so it runs as a person and what the app is granted stays within what that person may grant.
- **`units`** are a tree: `parent` names an earlier unit. `unit` on a person places them there.
- **`principals`** are automation accounts for `service_principal_ref` parameters and run-as accounts. They have no keys. `owner_eligible` is on by default in a sandbox, because a run-as account that writes records must be able to own them. Give a principal the roles its steps need (`entity.read`, `entity.list`, `entity.write`).
- **An automation group holds just its principal.** The setup checklist counts an active principal as a member of a group the package uses only for grants and for rules or stage moves that test membership, which is what the `automation_group` of `workflows.md` is for. Declare the principal in it and nobody else:

  ```json
  "groups": [{ "key": "automation", "name": "Automation" }],
  "principals": [{ "key": "loan_bot", "name": "Loan bot", "roles": ["Support"], "groups": ["automation"] }]
  ```

  Then `"automation_group": "@group:automation"` and `"automation_principal": "@principal:loan_bot"` in `install.parameters`. A group the package also assigns work to, or uses as the audience or an agent's access list, still needs a person, or setup reports it empty (`group_empty`). A deployment older than the rule that counts the principal counts only people: if the install reports `group_empty` for the automation group, add one person to it too, an account that never signs in (`"people": [{ "handle": "bot", "name": "Automation account", "groups": ["automation"] }]`), as an admin does in production.
- **`sla_policies`** are the SLA policies an `sla_policy_ref` parameter names, for an app whose work has a deadline clock. `key` follows the key rule above. `name` is 1 to 80 characters (not 120) and unique within the file ignoring case, because an organization's policy names are. `targets` is what an admin writes on the SLA policies page: `urgent`, `high`, `normal` and `low`, each `{ "value", "unit" }`, with `unit` one of `minutes`, `hours`, `days`, `business_hours` and `business_days`; a value is at least 1 and at most a year (525600 minutes, 8760 hours or business hours, 365 days or business days); and the four all run round the clock or all on the business calendar, which `settings.timezone` places.
- **`escalation_policies`** are the escalation ladders an `escalation_policy_ref` parameter names. `key` and `name` follow the rules of `sla_policies`. `steps` is what an admin writes on the escalation policies page (1 to 10 steps, each `{ "at", "action" }`; the step kinds and what each does are under "Escalation ladders" in the authoring skill's `work.md`), except that an assignee in an `assign` step names this file's objects: a `user`'s `id` is `@person:<handle>`, a `group`'s `id` is `@group:<key>`, and a fixed unit pool's `anchor.unit_id` and `group` are `@unit:<key>` and `@group:<key>`, also inside a dynamic assignee's `fallback`. A step may not start a workflow (`startWorkflow`): the workflow comes with the install, after the sandbox is made. `sandbox check` checks the names, those references, the number of steps and `startWorkflow`; AgentFlow checks the rest of a step when it makes the sandbox, before anything is written, naming the field.

  ```json
  "escalation_policies": [
    { "key": "late", "name": "Late replies", "steps": [
      { "at": { "kind": "onDue" }, "action": { "kind": "notifyCandidates" } },
      { "at": { "kind": "afterDue", "duration": { "value": 1, "unit": "business_hours" } },
        "action": { "kind": "assign", "to": [{ "kind": "group", "id": "@group:support_admin" }] } }
    ] }
  ]
  ```

  Then `"escalation_policy": "@escalation_policy:late"` in `install.parameters`.
- **`settings`** sets the organization's `timezone` (an IANA name) and `locale` (a language tag). Left out, the platform's defaults apply.

## Connections

`kind` is `resend` or `loopback`, both email connections, `sandbox_erp` or `odoo`, both ERP connections, or `chat`,
website chat. A `loopback` with a `channel` is a messaging connection instead (below). For the two email kinds,
`settings.from`, the address a step sends from unless it names another, is required and must be an email address;
`settings.reply_to` is optional. The refusal for any other kind reads
``connections[0].kind: `smtp` is not supported; only `resend`, `loopback`, `sandbox_erp`, `odoo` and `chat` are``.
Each kind takes only its own `settings` members, and another kind's is refused by name, such as
``connections[0].settings.origins: `origins` belongs to a chat connection``.

**`loopback`** sends nothing out of AgentFlow, and needs no account and no secret. Every message an Email step sends
through it is accepted at once and kept inside AgentFlow, and `email.sent` fires for it as for a Resend send, carrying
the Message-ID AgentFlow set (`message_id_source: "ours"`), so a test can follow a sent message without a Resend
account and without mailing anyone. Its one sending domain is the domain of `settings.from`: a step's own `from` must
be on it.

```json
"connections": [
  { "key": "mail", "kind": "loopback", "settings": { "from": "desk@example.com" } }
]
```

- A `secret_env` on a loopback connection is refused: `connections[0].secret_env: a loopback connection takes no secret`.
  The CLI sends no secret for it.
- `@connection:mail` in `install.parameters` answers an `email` `connection_ref` with it, as with a Resend connection.
- A loopback connection is made only from `sandbox.json`: no organization outside a sandbox can hold one, and the
  Integrations page cannot connect, edit or test it.

**`loopback` with a `channel`** is a messaging connection that calls no provider, for an app with a `messaging`
`connection_ref`: its `message.received` trigger, and later its Message step's replies. `channel` is one of `sms`,
`whatsapp`, `slack`, `teams`, `voice` and `webhook`, and every message injected on it travels on that channel. A
message arrives only when a test injects it with `agentflow-app sandbox message-in` (`sandbox-testing.md`, "Testing
inbound messages"). AgentFlow makes it under the provider `loopback_messaging`, in the `messaging` category, which is
the provider a trigger on it names and every event's `provider` reads.

```json
"connections": [
  { "key": "sms", "kind": "loopback", "channel": "sms" }
]
```

- It takes no secret and no settings: `connections[0].secret_env: a loopback connection takes no secret`, and
  `connections[0].settings: a loopback connection with a channel takes no settings`.
- `chat` is refused: ``connections[0].channel: `chat` is not a loopback channel: website chat is its own `chat`
  connection kind`` (below). Another value is ``connections[0].channel: `fax` is not a channel: write one of sms, whatsapp,
  slack, teams, voice, webhook``, and a `channel` on a `resend` or `sandbox_erp` connection is
  `connections[0].channel: only a loopback connection takes a channel`.
- `@connection:sms` answers a `messaging` `connection_ref`. `sandbox check` refuses a `messaging` parameter answered
  with an email or ERP connection, and an `email` one answered with a loopback that has a channel.
- Like the email loopback, it is made only from `sandbox.json`.

**`resend`** sends real mail through a Resend account.

- `settings.from` must be on a domain the Resend account has verified (`EMAIL_FROM_DOMAIN_UNVERIFIED` otherwise).
- `secret_env` names the environment variable the CLI reads the provider key from and sends when it makes the sandbox.
  If it is unset or empty, the CLI stops before any call with `SANDBOX_SECRET_MISSING`, naming the variable.
- Use a Resend account that belongs to no other organization. AgentFlow routes events by account, so a connected
  account would send the other organization's events into the sandbox: `SANDBOX_CONNECTION_SHARED`. A key Resend
  refuses, or a webhook it cannot register, is `CONNECTION_TEST_FAILED`; no sandbox is left behind.
- Mail in tests goes to Resend's test recipients only, `delivered@resend.dev`.

**`sandbox_erp`** is an ERP connection that calls no ERP, for a package that requires `rfx/erp-core` or reads an
`erp` `connection_ref` of its own. It offers the nine streams erp-core reads (`company`, `currency`, `uom`, `tax_code`,
`vendor`, `item`, `purchase_order`, `goods_receipt`, `vendor_bill`), and its own reads are always empty: a record
arrives only when a test injects it with `agentflow-app sandbox records-in` (`sandbox-testing.md`, "Testing an app on
`rfx/erp-core`"). It takes a draft bill written to it (an Integration step's `upsert` of a `vendor_bill` keyed on
`external_ref`), keeps it once per `external_ref` under `erp_id` `SBX-<external_ref>`, answers a `get` of it by
`external_ref`, and `sandbox records-out` lists what it kept. A bill reads back `draft` until a test sets it `posted` or
`cancelled` with `sandbox record-status`, or removes it with `sandbox record-remove`. Any other write, and a `get` of
any other object, is refused, and a search answers nothing.

```json
"connections": [
  { "key": "erp", "kind": "sandbox_erp" }
]
```

- It takes no secret and no settings: `connections[0].secret_env: a sandbox_erp connection takes no secret`, and
  `connections[0].settings: a sandbox_erp connection takes no settings`.
- `@connection:erp` answers an `erp` `connection_ref`, in `install.parameters` and in a dependency's answers under
  `install.decisions.parameters`. `sandbox check` refuses an `erp` parameter answered with an email connection, and an
  email one answered with `sandbox_erp`.
- Like a loopback connection, it is made only from `sandbox.json`: no organization outside a sandbox can hold one, and
  the Integrations page cannot connect, edit or test it.

**`odoo`** is a real Odoo, for a test that runs erp-core's polls and real draft-bill writes against one.
AgentFlow connects it the way an admin's Odoo form does, so the connection is
checked against Odoo when the sandbox is made, and it reads and writes as any Odoo connection.

```json
"connections": [
  { "key": "erp", "kind": "odoo", "secret_env": "ODOO_API_KEY",
    "settings": { "base_url": "http://localhost:8017", "database": "ap17", "login": "admin" } }
]
```

- `settings` are the Odoo form's fields: `base_url`, `database` and `login` are required, and `credential_expires_at`
  (`YYYY-MM-DD`) is optional. A missing one reads ``connections[0].settings.login: `login` is required``. `from` and
  `reply_to` are refused on it (``connections[0].settings.from: `from` belongs to an email connection``), and the Odoo
  fields on an email connection.
- The API key is the secret: `secret_env` names the variable the CLI reads it from, as for `resend`. An API key in
  `settings` is refused as an unknown member.
- AgentFlow checks `base_url` as it checks any Odoo address. An address on a private network, `localhost` included, is
  refused (`CONNECTION_CREDENTIALS_INVALID`) unless the deployment's `INTEGRATION_HOST_ALLOWLIST` names its host. A key
  Odoo refuses is `CONNECTION_TEST_FAILED`. Either way no sandbox is left behind.
- The Odoo may already be connected in another organization, your own included. Odoo is read by polling, so the
  sandbox's connection sees nothing of the other's, and `SANDBOX_CONNECTION_SHARED` does not apply.
- **The bills it writes are real drafts, and they stay in Odoo** after the sandbox is deleted and purged. Each one
  says `Written by AgentFlow sandbox <sandbox id>` in its notes (`narration`), so you can find and delete them in Odoo.
  A write finds a bill already under its `external_ref` and answers it, so vary the reference per run, or a later
  run meets an earlier run's draft.
- `@connection:erp` answers an `erp` `connection_ref`, as for `sandbox_erp`.

**`chat`** is website chat: a real chat connection, the one a website's `<agentflow-chat>` names by its public key
(the authoring skill's `workflows.md`, "Putting the chat on a website", has the snippet and the identity token), for
an app with a `messaging` `connection_ref` whose `message.received` workflows answer visitors with a Message step.
A message arrives only when a visitor writes, and in a test the visitor is `agentflow-app sandbox message-in`, which
calls AgentFlow's public chat routes as a website's page does (`sandbox-testing.md`, "Testing website chat"). The
deployment must have website chat on (`CHAT_ENABLED`), or create refuses it at `connections[i].kind`.

```json
"connections": [
  { "key": "site_chat", "kind": "chat",
    "settings": { "origins": ["http://localhost:5173"], "languages": ["en", "vi"], "greeting": "Hi, how can we help?",
                  "verify_methods": ["site"], "auto_typing": true } }
]
```

Every member of `settings` is optional, and `settings` may be left out:

- **`origins`**, the pages the chat takes requests from, each `https://host[:port]`, or `http` on `localhost` or
  `127.0.0.1` only, with no path; at most 20. Left out, it is `http://localhost`, which is what the CLI sends as
  `Origin`; the CLI always sends the first. A bad one is refused at `connections[0].settings.origins[<n>]`, such as
  ``connections[0].settings.origins[0]: `http://shop.example.com` is not an `https` origin; `http` is accepted only on
  `localhost` and `127.0.0.1` ``.
- **`languages`**, `en`, `vi` or both, `en` when left out; **`greeting`**, at most 500 characters, shown in the first
  language.
- **`verify_methods`**: `site` (the website's server signs an identity token; the CLI's `--verified-email` needs it),
  `email_code` (a code mailed to the visitor) and `agentflow` (a sign-in at this deployment, refused at create when it
  does not sign people in through an identity provider). None when left out.
- **`email_connection`**, the key of an email connection declared earlier in the file, which `email_code` sends its
  codes through and requires: ``connections[1].settings.email_connection: `erp` is not an earlier email connection``.
  It is refused without `email_code`.
- **`auto_typing`**: show that a reply is being written, for 20 s, as soon as the visitor's message is stored. An
  admin turns the same setting on for a production connection in AgentFlow; the authoring skill's `steps.md` (the
  `message` row) compares it with a Message step's `typing`.

It takes no secret: ``connections[0].secret_env: a chat connection takes no secret``. Its public key, its origins and,
with `site`, its identity secret are in the create answer's `chat.<key>` and in `.agentflow/sandbox.json`; the secret
is shown once and printed by no command. `@connection:site_chat` answers a `messaging` `connection_ref`, as a
loopback with a `channel` does. A sandbox turns the chat's per-address session limits off, so a test may open many
threads from one machine.

## Dependencies

`dependencies` lists sealed packages (`.afpkg` files, paths relative to the folder) that `deploy --sandbox` uploads,
with the sandbox's deploy key, before the folder's package, in the order given; `deploy --sandbox --upgrade` uploads
them again, which changes nothing for one the sandbox already holds. The install then finds a package the manifest's
`requires.packages` names among the sandbox's uploads, so it need not be in the deployment's app catalog. The CLI reads
the member and AgentFlow never sees it.

```json
"connections": [{ "key": "erp", "kind": "sandbox_erp" }],
"groups": [{ "key": "readers", "name": "ERP readers" }],
"dependencies": ["deps/rfx-erp-core-1.0.0.afpkg"],
"install": {
  "parameters": { "erp": "@connection:erp" },
  "decisions": { "parameters": { "rfx/erp-core": { "erp": "@connection:erp", "erp_readers": "@group:readers" } } }
}
```

- **A dependency's answers** go in `install.decisions.parameters["<package id>"]`, an `@` reference resolved as in
  `install.parameters`. `sandbox check` compares them with the parameters of the dependency's own manifest, read from
  its file: an unknown key, a value of the wrong kind and a connection of the wrong kind are refused, and a required
  parameter with no default and no answer is a warning, worded as for the folder's package.
- **Each entry** ends in `.afpkg` and appears once (`dependencies[0]: ... is not a sealed package: name an .afpkg file`).
  A file that cannot be read, or holds no `manifest.json` with an `id` and a `version`, stops `sandbox check` and
  `deploy --sandbox` before any request.
- **erp-core's file** is a sealed `rfx/erp-core`: the one your team installs, or one sealed from the SDK's
  `apps/erp-core` at the tag you build with. That folder holds its built `package/`, so sealing needs no install:
  copy the folder out of the SDK checkout and, in the copy, run your project's CLI with your project's key,
  `<project>/node_modules/.bin/agentflow-app seal --key <project>/keys/<id>.pem --out <project>/deps`. Any
  intact sealed package installs in a sandbox, whatever key sealed it. Commit it beside `sandbox.json` (it is a
  package, not a secret), and replace it when you move to another erp-core version.
- **A required package the list does not upload** is looked for in the deployment's app catalog, and `sandbox check`
  warns about it: ``requires.packages: <id> is not among sandbox.json's dependencies, so the install looks for it in the
  deployment's app catalog, ...``.

## Field security

`field_security` secures fields and grants field security profiles, so a sandbox has the field access the app has in
production from the start, for a person checking the app (`sandbox open --as <handle>`) and for every test. Without
it, a new sandbox secures no field, and every person and every workflow there reads every value. The CLI reads the
member and AgentFlow never sees it.

```json
"groups": [{ "key": "sales", "name": "Sales" }, { "key": "automation", "name": "Automation" }],
"field_security": {
  "profiles": [
    {
      "name": "P&L · Số đơn hàng",
      "access": "read_write",
      "fields": "recommended",
      "groups": ["sales", "automation"],
      "agents": ["contract_reader", "approval_writer"]
    }
  ],
  "secure": ["order.internal_note"]
}
```

- **`profiles`**: each is saved whole under its `name` (1 to 120 characters, once in the file).
  - `access` is `read` or `read_write`. `read_write` lets the holders set the field on create and change it on
    update, except on a formula or a rollup, which is read only whatever `access` says.
  - `fields` is `"recommended"`, the fields the installed app marks `recommendedSecured`, or a list of
    `"<entity>.<field>"`, which may hold `"recommended"` as well. `<entity>` is the package's own key for the entity
    (`order`, not the installed `acme_pl__order`), or the key of an entity it requires; `<field>` is the field's key.
  - The holders: `groups` and `principals` by their keys in this file, `people` by handle, and `agents` by the
    package's key for the agent (its `objects/agent/<key>.json`). Only the app's own agents: an agent it requires
    from the organization is not named here. A profile may have no holder: its fields are then secured and read by
    nobody until a test grants it (`sandbox-testing.md`, "Field security in a test").
- **`secure`** lists fields to secure without granting them to anyone, in the form `fields` takes.
- **What a deploy does.** `deploy --sandbox`, with `--upgrade`, with `--replace` and with `--no-arm`, applies it as
  the sandbox's owner after the install finishes and before it arms the triggers, so no run a trigger starts meets a
  field unsecured or a holder without its profile. It secures each field that is not secured yet, then creates each
  profile, or replaces the fields and holders of the one with that name, keeping its description. A second run
  changes nothing. It prints `field security: secured 29 fields; created profile P&L · Số đơn hàng`, or
  `field security: already as sandbox.json sets it`, and `--json` carries
  `field_security: { secured: ["order.cost", ...], profiles: [{ name, id, outcome }] }`, `outcome` being `created`,
  `updated` or `unchanged`. `sandbox create` installs nothing, so it applies nothing.
- **A formula or rollup over a secured field** is secured too, or AgentFlow refuses to secure the field: an unsecured
  formula, or an unsecured rollup on another entity, would show its value to every reader. List both, as
  `"recommended"` does when the package marks both, and the deploy secures the formula or rollup first, whatever the
  order. A file that secures a field and not a formula or rollup reading it is refused
  (`ENTITY_FORMULA_SENSITIVE_INPUT` for a formula, `ROLLUP_SOURCE_IN_USE` for a rollup), naming each field and its
  reader: add the reader to `secure` or to a profile's `fields`.
- **What it never does.** It never unsecures a field, even one the file no longer lists, and never changes or deletes
  a profile the file does not name, so renaming a profile in the file leaves the old one. Unsecuring would show the
  field to every reader at once and take it out of every profile, including one made by hand, while a field left
  secured only hides more, which a test notices. `deploy --sandbox --replace` starts from a clean sandbox; a test
  unsecures a field on purpose with `unsecureField`.
- **A change to it needs no new sandbox.** `field_security` does not count as a change to `sandbox.json`
  (`SANDBOX_SPEC_CHANGED`), and `--upgrade` applies it as the file says it now, unlike the answers recorded when the
  sandbox was made. With the package unchanged, `--upgrade` replays the earlier deployment and applies it, so a change
  to `field_security` alone needs no new `version`.
- **An extension's fields** are never among `"recommended"`, even ones the extension marks `recommendedSecured`:
  AgentFlow records the mark on each field the app installs, and an extension field is installed on another
  package's entity. Name each one, on its target entity, by its installed key, `<prefix>__<field>`:
  `"vendor.acme_vendor_risk__risk_rating"`. `sandbox check` warns when `"recommended"` leaves some out.
- **Checks.** `sandbox check` and every `deploy --sandbox` refuse, before any request, a member the profile does not
  take, an `access` that is not one of the two, `fields` that is neither `"recommended"` nor a list of
  `<entity>.<field>`, an item listed twice, a group, principal or handle the file does not declare, and a name used
  twice. With `package/` built, they also refuse a field the package's own entity does not have and an agent the
  package does not ship; `deploy --sandbox --file <archive>` skips that, since the archive need not be what
  `package/` holds, and leaves it to the check after the install. `deploy --sandbox --upgrade` checks
  `field_security` alone and not the rest of the file. Before it uploads anything, the deploy refuses a group, person
  or principal the recorded sandbox does not hold (one the file declared after the sandbox was made: `--replace`
  makes a sandbox with it). After the install, before it changes anything, it refuses a field or an agent the
  installed app does not have. A refusal there, or AgentFlow refusing a change, leaves the app installed with its
  triggers not armed and its objects recorded: fix it and run `deploy --sandbox --upgrade`, which applies it again
  and arms them.
- **An older AgentFlow** without the published field access operations, or without the list of an installed app's
  agents, is refused `SANDBOX_FIELD_SECURITY_UNSUPPORTED`; the second only when a profile names an agent.

## What a sandbox cannot hold

`sandbox.json` makes people, roles, groups, units, principals, SLA and escalation policies, email connections (Resend
or loopback), messaging connections (a loopback with a `channel`, or website `chat`), an ERP connection with no ERP behind it
(`sandbox_erp`), a real Odoo (`odoo`) and the organization's settings, and
`deploy --sandbox` installs the folder's package after the packages `dependencies` names. Three things of an app
therefore have nothing to run on in a sandbox.

- **A connection that is neither email, messaging nor ERP.** `connections[].kind` is `resend`, `loopback`,
  `sandbox_erp`, `odoo` or `chat`, so a CRM, database, data warehouse or file storage `connection_ref` has no connection to
  point at. AgentFlow refuses the install when an enabled object, a grant or the audience uses that parameter. An
  `erp` one has a connection only when the file declares a `sandbox_erp` or `odoo` connection, and a `messaging` one
  only when it declares a `loopback` with a `channel` or a `chat`.
- **A `secret_ref`.** `sandbox.json` makes no secret and a sandbox holds none, so no id can name one there: a value for
  the parameter does not help, and an `@kind:` reference is refused. A workflow that uses the secret, such as a
  Webhook step's `auth.secret`, cannot be installed enabled.
- **A required package that is neither among `dependencies` nor in the deployment's catalog.** The install looks for a
  package in `requires.packages` among the sandbox organization's uploads (yours and your `dependencies`) and the
  deployment's app catalog ("Dependencies", above).

**Records an ERP holds** are not among them: a `sandbox_erp` connection reads nothing by itself, and the records
erp-core's sources keep (written by the sync alone, so a test cannot create one, `ENTITY_SOURCE_OWNED`) arrive when a
test injects them with `sandbox records-in`.

**What `sandbox check` and `deploy --sandbox` say about them**, before anything is made. They read
`package/manifest.json` and `package/objects/`, so run `pnpm build` first:

- **A refusal** (`SANDBOX_SPEC_INVALID`, exit `1`, at `install.parameters.<key>`, or at
  `install.decisions.parameters.<package id>.<key>` when the value is there) for a `secret_ref` parameter, or a
  `connection_ref` whose `category` is `crm`, `database`, `data_warehouse` or `file_storage` (or `erp` with no
  `sandbox_erp` or `odoo` connection in the file), that an object under `package/objects/` uses, when it is required with no
  default and no value, **and when `sandbox.json` gives it a value** (a required parameter, or any `secret_ref`). The
  message names the first such object. With no value AgentFlow refuses the install (`APP_PARAMETER_REQUIRED`); with
  one, setup looks the id or connection up among what the sandbox holds and refuses the install. A value for an
  optional connection is left alone: setup does not block on an optional parameter. A dependency's answer is refused
  the same way when its parameter is required, whether or not its objects use it.
- **A warning** (`requires.packages: …`) for each required package `dependencies` does not upload: it must come from the
  deployment's app catalog, which `sandbox check` cannot read.
- **A warning** for any other required parameter with no default and no value, a `connection_ref` with an `email`
  category or none included: `sandbox.json` can give it a value (`@group:`, `@principal:`, `@connection:`), so add one.
  AgentFlow refuses the install when an enabled object, a grant or the audience uses it. The exception is a required
  secret, or a connection of a kind a sandbox cannot make, that nothing uses: no value works for it and none is
  needed, so the warning cannot be cleared from `sandbox.json`; leave it unset.

Instead: test those steps on a real installation, in an organization that has the connection and the package. Test in
the sandbox what needs none of them, and list the rest in the app's README as not run in a sandbox.

## The install's answers

- **`install.parameters`** answers the manifest's parameters by key. An `@` reference stands for an object of this file, and AgentFlow replaces it with that object's id when it makes the sandbox:

  | Written | Becomes |
  |---|---|
  | `@group:<key>`, `@unit:<key>`, `@principal:<key>`, `@person:<handle>` | that object's id |
  | `@connection:<key>` | the `{provider, externalAccountId}` pair a `connection_ref` parameter takes |
  | `@sla_policy:<key>` | that SLA policy's id, for an `sla_policy_ref` parameter |
  | `@escalation_policy:<key>` | that escalation policy's id, for an `escalation_policy_ref` parameter |

  Any other value is sent as written. A reference to something the file does not declare is refused, naming it: `install.parameters.<key>: …names no group in this file`.
- **`install.decisions`** is the setup page's choices, by package id: `parameters` (a dependency's answers; an `@` reference in a value is resolved as in `install.parameters`, and `sandbox check` compares them with the dependency's parameters when `dependencies` names its file), `features` (the optional features to turn on) and `approved_clients` (the clients to approve). A package it does not name gets the sandbox defaults, which the CLI adds after the first plan: every optional feature on and every client approved, with grants as suggested. A package it names keeps exactly what it says, so an empty list stays empty.
- `deploy --sandbox` refuses `--parameters` and `--decisions` (`USAGE`): this file holds both. `install.decisions` is not bound by `deploy --decisions`' rule that a decision may only decline a grant: the owner approves the sandbox's install with every choice the setup page offers.
