# `sandbox.json`: every member and rule

`sandbox.json` sits at the project's root and is committed. `agentflow-app sandbox check` checks it offline, and AgentFlow checks it again when the sandbox is made. A refusal reads `SANDBOX_SPEC_INVALID`, then `sandbox.json: <field>: <message>` with the wording AgentFlow uses, and names the first problem it finds.

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
      "mail_connection": "@connection:mail"
    },
    "decisions": {}
  }
}
```

Only `people` is required. Any other member left out is empty.

## The cast

- **Keys and handles.** A `handle`, and a `key` of a group, unit, principal or connection, match `[a-z][a-z0-9_]{0,31}` and are unique within their list. A list holds at most 100 entries, and a `name` is 1 to 120 characters.
- **`roles`** on a person or principal names a built-in role (`admin`, `designer`, `viewer`) or a role this file declares. A declared role may hold any permission AgentFlow has except `sandbox.create`, `deployment.admin` and `retention.delete`; the refusal names the role. A declared role may not reuse a built-in role's name.
  - **A person holds only the roles listed.** With no `roles` they hold none, not even `viewer`. So give each person a role that holds what the manifest's `requires.permissions` asks of their group, or they cannot do the app's work: `requires.permissions` is only a check, and nothing grants it for you. Anna in the example holds the `Support` role the file declares, with the three permissions an app that reads, lists and writes records asks for (`entity.read`, `entity.list`, `entity.write`; add `entity.delete` for an app whose people delete records). A role is not a grant on an entity: the app's own grants still decide which records a person reaches.
  - **The built-in roles.** `admin` holds every permission AgentFlow has except four that are opt-in only, `dashboard.manage.any`, `entity.records.restore`, `instance.read.any` and `sandbox.create` (it does hold `deployment.admin` and `integration.admin`). `designer` holds `agent.design`, `entity.delete`, `entity.design`, `entity.list`, `entity.read`, `entity.write`, `form.design`, `workflow.design`, `workflow.publish` and `workflow.simulate`. `viewer` holds no permission at all. Every other permission name, with what it allows, is in the guide's Roles & permissions page, `<AGENTFLOW_URL>/guides/en/bat-dau/vai-tro-quyen` (Vietnamese: `<AGENTFLOW_URL>/guides/bat-dau/vai-tro-quyen`).
- **`owner`** is the handle of a person who holds the built-in `admin` role (default `admin`). The owner approves the install, so it runs as a person and what the app is granted stays within what that person may grant.
- **`units`** are a tree: `parent` names an earlier unit. `unit` on a person places them there.
- **`principals`** are automation accounts for `service_principal_ref` parameters and run-as accounts. They have no keys. `owner_eligible` is on by default in a sandbox, because a run-as account that writes records must be able to own them. Give a principal the roles its steps need (`entity.read`, `entity.list`, `entity.write`).
- **An automation group needs a person in it, as setup does.** The setup checklist counts only people as a group's members, so a group that holds just a principal is reported empty (`group_empty`). For the group your manifest gives the run-as principal (the `automation_group` of `workflows.md`), declare the principal in it **and** one person in the same group, the account that never signs in, as an admin does in production:

  ```json
  "groups": [{ "key": "automation", "name": "Automation" }],
  "principals": [{ "key": "loan_bot", "name": "Loan bot", "roles": ["Support"], "groups": ["automation"] }],
  "people": [{ "handle": "bot", "name": "Automation account", "groups": ["automation"] }]
  ```

  Then `"automation_group": "@group:automation"` and `"automation_principal": "@principal:loan_bot"` in `install.parameters`. A test has no reason to act as `bot`.
- **`settings`** sets the organization's `timezone` (an IANA name) and `locale` (a language tag). Left out, the platform's defaults apply.

## Connections

- `kind` is `resend`, the only one supported. `settings.from` is required and must be an email address on a domain the Resend account has verified (`EMAIL_FROM_DOMAIN_UNVERIFIED` otherwise). `settings.reply_to` is optional.
- `secret_env` names the environment variable the CLI reads the provider key from and sends when it makes the sandbox. If it is unset or empty, the CLI stops before any call with `SANDBOX_SECRET_MISSING`, naming the variable.
- Use a Resend account that belongs to no other organization. AgentFlow routes events by account, so a connected account would send the other organization's events into the sandbox: `SANDBOX_CONNECTION_SHARED`. A key Resend refuses, or a webhook it cannot register, is `CONNECTION_TEST_FAILED`; no sandbox is left behind.
- Mail in tests goes to Resend's test recipients only, `delivered@resend.dev`.

## The install's answers

- **`install.parameters`** answers the manifest's parameters by key. An `@` reference stands for an object of this file, and AgentFlow replaces it with that object's id when it makes the sandbox:

  | Written | Becomes |
  |---|---|
  | `@group:<key>`, `@unit:<key>`, `@principal:<key>`, `@person:<handle>` | that object's id |
  | `@connection:<key>` | the `{provider, externalAccountId}` pair a `connection_ref` parameter takes |

  Any other value is sent as written. A reference to something the file does not declare is refused, naming it: `install.parameters.<key>: …names no group in this file`.
- **`install.decisions`** is the setup page's choices, by package id: `features` (the optional features to turn on) and `approved_clients` (the clients to approve). A package it does not name gets the sandbox defaults, which the CLI adds after the first plan: every optional feature on and every client approved, with grants as suggested. A package it names keeps exactly what it says, so an empty list stays empty.
- `deploy --sandbox` refuses `--parameters` and `--decisions` (`USAGE`): this file holds both.
