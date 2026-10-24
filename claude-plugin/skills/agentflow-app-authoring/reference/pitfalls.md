# Pitfalls

Each of these was met building a real app. Most build cleanly and fail later, when the app is installed or
used, so read this list against your config before you hand it off. Each entry gives the symptom, the cause,
and what to write instead.

## References and text

- **A `${param:…}` shows up literally in a name or a description.**
  Cause: an entity's or a workflow's `name` and `description` are carried as written, not translated.
  Instead: write plain text there. Put parameter values in workflow templates through `readParameters`.
- **`an authoring reference the builder does not know: Case for ${param:app_users}`.**
  Cause: a reference inside a longer string. References are whole strings.
  Instead: read the parameter into a variable (`readParameters("company_name")`) and use
  `{{ vars.company_name }}` in the template (`workflows.md`).
- **`entity key my-case holds a hyphen`.**
  Cause: only a skill name may hold `-`.
  Instead: use `_` in every other key.
- **An enum option shows no colour, or the install is refused for it.**
  Cause: a colour outside the platform palette, such as `green` or `red`. The builder and `lint` pass it; AgentFlow
  checks it at install.
  Instead: use `gray`, `sky`, `teal`, `amber`, `emerald`, `violet`, `indigo`, `rose` or `fuchsia`, or `#RRGGBB`.

## Access

- **An organization admin cannot see or change records.**
  Cause: there is no admin bypass of record access.
  Instead: give admins a group parameter with `"scope": "organization"` grants, and add that group as a
  stage-model mover wherever admins move records.
- **Setup refuses with `APP_GRANT_RECIPIENT_COLLISION`.**
  Cause: two grants on the same entity give access to the same group, which happens when the admin picks one
  group for two group parameters that each carry a grant on that entity (`loan_users` and `it_staff`, both on
  `loan`). The setup page lists the code under the plan's problems, and the plan cannot be approved until two different groups are chosen.
  Instead: write each such parameter's `help` to say it must be a different group from the other, naming it, and
  that members may overlap (a person can belong to both groups). Example: `"help": "IT staff who approve
  equipment loans. Must be a different group from Loan desk users (the same person may be in both)."`
- **`entities/case.json#/access/mode: one of everyone, restricted`.**
  Cause: `access.mode` left out. The installer would have defaulted it to Everyone.
  Instead: always write `"mode": "restricted"` (or `everyone`, deliberately).
- **A person carries a record into another parent they manage.**
  Cause: grants judge the stored parent, so anyone who may update the record and manages another parent
  can move it there.
  Instead: unless moving is a feature, fix the parent after create with a rule: `is_update` and
  `changed` on the parent field (`team_is_fixed` in `rules-and-stages.md`).
- **A view for "my records" with `{ "$bind": "viewer.id" }` in `filters` is refused by `pnpm build`.**
  The message reads `entities/<entity>.json#/views/<n>/filters/<m>/value: a fixed filter compares as written and
  never resolves $bind: put the filter in a preset in config.presets`.
  Cause: only a preset (`config.presets`) reads the person looking; a fixed filter compares the value as text, so
  the view would list nothing. (A build from SDK 0.3.0 or earlier let it through, and the view listed nothing.)
  Instead: a preset, or a record scope in the grant (`entities.md`, "Views"). A preset is never preselected and
  a launcher entry cannot open one; a record scope does not narrow a person who also holds a wider grant. For
  "my X" that is mine for everyone, including people with organization scope, use a UI module screen.
- **An "overdue" view lists the wrong records.**
  Cause: `within` windows all include today, so a fixed filter cannot express "due before today".
  Instead: a view of the open records sorted by the due date ascending, with a "Past due" preset
  `due lt { "$bind": "today" }`, and a launcher entry named for the view, not "Overdue" (`entities.md`, "Views"). To
  open the overdue list itself from the launcher, use a `module` entry whose screen sends the comparison.
- **A label or category that other rules depend on is edited, and records using it stop saving.**
  Cause: other rules compare against its meaning.
  Instead: fix that field after create with a rule, as above.

## Rules

- **A rule meant for edits refuses every create.**
  Cause: on a create, every test of the record is false and its negation true.
  Instead: start an edit-only rule with `{ "kind": "write", "write": { "op": "is_update" } }`.
- **A rule about the stored value never fires, or fires on the wrong write.**
  Cause: a field leaf reads the value being written.
  Instead: use a `was` leaf for "the stored value is …" (`frozen_is_frozen` in `rules-and-stages.md`).
- **A rule or a stage move refuses the app's own workflow.**
  Cause: a workflow a trigger starts runs as a service principal, which passes only `in_group`, not
  `is_elevated_run`. A workflow people start runs as the person who started it, so a rule that refuses that
  person refuses the workflow.
  Instead: put the service principal in an automation group, and negate `in_group` on it in the rule, or list
  it as a mover. For a move only one group may make, let a trigger start the workflow that records it
  (`workflows.md`, the worked example).
- **The automation group cannot be set up with only the service principal in it.**
  Cause: setup counts only people as a group's members.
  Instead: say in the group parameter's `help` to add one dedicated account that never signs in, and no one
  else.
- **A `$field` comparison never matches.**
  Cause: `$field` needs the same type on both sides, and a text formula is not an enum.
  Instead: compare through the reference (`label.base_status`) to the enum field.
- **A new field is editable by everyone with `update`.**
  Cause: `changed_any` names fields one by one, and the rule that guards its peers does not name it.
  Instead: add every new field to the rule that guards its peers.
- **A rule cannot express "at most 20 children".**
  Cause: rules may not read rollups.
  Instead: enforce it in the UI, or not at all.
- **Children are created under a closed parent.**
  Cause: nothing refuses them.
  Instead: a rule `is_new` and `parent.status` equals `closed` (`no_item_in_closed_team` in `rules-and-stages.md`).

## Fields and forms

- **A people list on a create form does not show a person picker.**
  Cause: `"format": "entity"` written on the array.
  Instead: put `"format": "entity"` under `items`, and keep `x-entity` on the array (`entities.md`).
- **A create through the records API drops fields it set.**
  Cause: `POST /entities/{id}/records` (a UI module, a service principal, a person on the create page) keeps
  only the fields the create form binds, and drops the rest silently. A workflow's `create` step is not
  filtered: it writes every field it binds.
  Instead: patch the other fields in a second write, or have a workflow create the record. Treat a failed
  second write as a partial create (the record exists): do not retry the create. Binding a field only to set it
  also shows it on AgentFlow's own create page.
- **A rollup does not count what you meant.**
  Cause: a rollup written like a formula, or an `inverseKey` that no child reference declares.
  Instead: `"type": "formula"`, `"formula_result_type": "number"`, no `formula_expression`, and a `rollup`
  of `inverseKey` (camelCase: the child reference's `inverse_key`), `agg` and an optional `filter`.
- **A formula that reads through a reference hides the record's fields from workflow decisions.**
  Cause: a formula reading through a reference that can be empty (`label.base_status`).
  Instead: avoid such formulas for now; a rule can compare the hop directly.
- **Deleting a target with `on_target_delete: clear` is refused.**
  Cause: a clearing delete is all or nothing. The deleter needs `update` on every record that points at the
  target, or the platform answers 403 `ENTITY_RECORD_CASCADE_FORBIDDEN`; and more than 499 records pointing
  at it answers 422 `ENTITY_RECORD_CASCADE_TOO_LARGE`.
  Instead: say so in the UI with the count, and offer a rename.
- **Comments are on, but the record page shows no thread.**
  Cause: the package ships a `detail` view whose layout has no `comments` block. Installing does not add one,
  and a comment notice opens that page.
  Instead: put `{ "kind": "comments" }` at the bottom of the layout's wide column (`entities.md`, Comments).

## Workflows and triggers

- **A workflow's decisions take the default branch, as if the record had no fields.**
  Cause: the workflow's run-as principal cannot read something the record carries: most often a formula
  that reads through a reference to an entity the principal has no grant on. Everyone never covers a service
  principal, so a grant to Everyone alone does not count. (On an AgentFlow release before rollups were read
  as fields, a record with a rollup was withheld the same way.)
  Instead: give the principal's group read on every entity a formula of the record reads through (an automation
  group that reads `tag` for a formula `tag_status` on `item`). Give a decision an `otherwise` branch that writes
  nothing, and test `==` on the values you act on, never `!=`: a withheld value reads as null.
- **A record trigger's input arrives empty, or the install fails on the trigger.**
  Cause: an `input_mappings` entry written `{ "from": "status" }`.
  Instead: every `from` starts with `event.`: `event.<field>`, or `event.event.previous.<field>` for the value
  before the change. The run reads it as `input.<to>`.
- **`lint` says `run_as_not_initiator`.**
  Cause: a workflow that people start (a start grant, an entity action, a Call from one of those) runs as a
  service principal.
  Instead: run it as `INITIATOR`. What only a group may do belongs to a workflow a trigger starts.
- **`lint` says `bare_key` in a workflow.**
  Cause: a position that takes a key holds a bare key or an id-form reference. A start form's `x-entity` is
  not one of these: the builder writes its key form. A workflow variable's `entity` or a relationship step's key
  is, when written as a plain string or `${entity:…}` by hand.
  Instead: write `"x-entity": "<entity key>"` and let the builder translate it. That only makes the schema
  valid: AgentFlow draws no launch form from `inputSchema`, so to let a person choose a record use an entity
  action with `subject`, or make the request a record (`workflows.md`, "Start forms").
- **`build` refuses an `x-entity`.**
  Cause: a start form's or a create form's `x-entity` names something that is not an entity of the package, `user`
  or `org_unit` (a typo, or an entity another package owns).
  Instead: name an entity key of this package, or `user` or `org_unit`.
- **A Human step assigned to a group is never done.**
  Cause: nobody claimed it, or the group has no active person. A member must claim it before filling it in.
  Instead: tell the group's members to claim it from My Work, and keep the group's membership up to date.
- **A workflow cannot remove one item from a list field.**
  Cause: a workflow can only replace a list or append to it.
  Instead: design the list so that a workflow never needs to remove one item.
- **A trigger added in an upgrade never runs.**
  Cause: an upgrade never changes whether a trigger is on, and a new trigger, or one moved to another
  workflow, lands off.
  Instead: tell installers, in the `changelog`, which new triggers to turn on.
- **The install fails with `APP_STEP_FAILED on trigger:<key>`, and the build passed.**
  Cause: two triggers name the same workflow. A workflow has at most one trigger.
  Instead: make one workflow per trigger, both built by one helper that takes what differs between them
  (`freeze_on_close` and `unfreeze_on_reopen`, say), and give each its own trigger.
- **`APP_FILE_INVALID: agentflow.app.mjs: add open_case to ORDER`.**
  Cause: a workflow in a module that `ORDER` does not list.
  Instead: add it to `ORDER`, after every workflow it calls.

## Dashboards and the launcher

- **`dashboards/o.json#/filter_bar: a package cannot install a filter bar yet`.**
  Instead: ship tiles only.
- **A "due before today" tile filter.**
  Cause: it cannot be expressed yet.
  Instead: leave that tile out.
- **Nobody but the installer sees the dashboard, or its launcher entry.**
  Cause: a packaged dashboard installs private, and an entry is hidden from anyone who cannot open its target.
  Instead: tell installers to share the dashboard with the audience group after installing.
- **`a module target needs the package's ui`.**
  Cause: a `module` launcher entry in a package with no `ui` member.
  Instead: add `ui`, or target an object.
- **An object target is refused.**
  Cause: it names a workflow, an object the package does not build, or uses a form other than a reference.
  Instead: `${dashboard:…}`, `${entity:…}` or `${entity_view:…}` of this package.
- **A launcher label appears in an unexpected language.**
  Cause: with neither the person's language nor `contentLocale` given, the sidebar takes the first tag in
  alphabetical order, not the first written.
  Instead: give every language you need, `contentLocale` among them.
- **A module path is refused.**
  Cause: `//` anywhere (even after `?` or `#`), a backslash, a control character, or a `.` or `..` segment.
  Instead: percent-encode a URL inside a query, and write plain paths.
- **A `launch_url` is refused, or the package's value does not show.**
  Cause: anything but lowercase `https://`, or a user or password in it; or an admin's override, which wins
  and which an upgrade never changes.
  Instead: write a plain `https://` address.
- **A module entry is listed to someone who can read no record.**
  Cause: a module entry is listed to everyone in the app's audience; what they may open inside it is the
  module's business.
  Instead: have the module handle a person with no access.

## What `build` does not check

`pnpm build` refuses a view `filters` entry or a preset rule whose field is not a field of the entity (or, with
`reference.field`, of the package entity the reference points at), whose `op` does not suit the field's type, whose
`within` value is not a window, or whose value has the wrong shape for its `op`; a `$bind` in a fixed filter; a
`ui.kind` other than `module` and a `ui.contract` other than 1 or 2. It warns about a launcher icon AgentFlow does
not have. A green build still does not prove the package installs. These are refused only when the package is
installed, so the first place they run is `deploy --sandbox`:

- a view's role field of the wrong type (`group_by_field`, `date_field` and the others in `entities.md`);
- a filter on a field that is not `filterable`;
- a `$bind` token that is not one AgentFlow knows, or one used with an operator it does not take;
- a filter that hops through a reference to an entity outside the package;
- a rule's fields and operators;
- an enum colour outside the palette, a `format` or constraint a field type does not take.

A `ui.contract` the AgentFlow you deploy to does not know is refused earlier, at `lint` and at upload, as
`manifest_invalid` at `manifest.json`, and the message does not name `ui.contract`.

## The project

- **`config/build/` is missing from a commit.**
  Cause: a repository `.gitignore` that ignores `build/`.
  Instead: add an exception for the app's `config/build/`.
- **The install is refused with `human.assignee_fallback_required`.**
  Cause: a Human step whose every candidate is dynamic (the initiator, a field, a manager) and none has a
  `fallback`. The build does not report it.
  Instead: add `fallback: [{ kind: "group", id: "${param:app_users}" }]` to the candidate (`workflows.md`).
- **`pnpm check` names `ui/…` files `stale`, `missing` or extra in a project with a UI module.**
  Cause: `pnpm check` compares package/ui with the module when package/ui exists, and a module change is in it
  only after a build. Without `package/ui` (git ignores it) the check says nothing of the module, and `seal` refuses.
  Instead: run `pnpm build`, then `pnpm check`.
- **A module's `@` menu fails ("Không tìm được") once the app runs under a ceiling.**
  Cause: `GET /mentions/people` is refused with `403 APP_CEILING_DENIED` unless the package requires the `user`
  entity and lists its `name` (the email is told, and matched, only while `email` is listed too). `fields: {}` tells
  nothing.
  Instead: `requires.entities: [{ "key": "user", "access": "read", "fields": { "name": "text", "email": "text" } }]`.
  An embedded module calls as the person and is not cut.
