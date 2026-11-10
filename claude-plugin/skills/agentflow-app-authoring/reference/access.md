# Access: who may do what

An entity's `access` is `{ "mode", "grants" }`. Nobody reaches a record except through a grant: there is no
bypass for organization admins, and a workflow a trigger starts, which runs as a service principal, needs a grant for that principal's group too.

## `mode`

`restricted` or `everyone`, and it is required: a file without it is refused
(`entities/case.json#/access/mode: one of everyone, restricted`), because the installer would otherwise
default the entity to Everyone. Every example uses `restricted`.

## A grant

`{ "principal", "design"?, "operations" }`:

- **`principal`** is `{ "kind": "group", "id": "${param:<group_ref parameter>}" }` or `{ "kind": "everyone" }`.
  Nothing else: not a user, not a service principal (`a package grants to a group or everyone only`). An
  Everyone grant has no `id`, and an entity has at most one.
- **`design`** is absent or `false` (`a package grant never carries design authority`).
- **`operations`** is a list of `{ "operation", "scope"?, "record_scopes"? }`, each operation at most once per
  grant. `operation` is `read`, `list`, `create`, `update`, `delete` or `assign`. An entry needs `scope`,
  `record_scopes`, or both.
  - `scope` is a string such as `organization` (every record) or `own`, or one of the unit scopes below.
  - `record_scopes` limits the operation to records the caller is tied to (below).

Each grant becomes an entry of the manifest's `grants`, keyed `<entity>_<recipient>`: the parameter's key
without a trailing `_group_id`, or `everyone`. The case desk's grant is `case_app_users`.

## Units: `placement`, `unit` and `subtree`

A grant's `scope` can follow the organization's units, on an entity that says `"requires_unit_classification": true`
(`entities.md`, "Records filed in a unit"), whose records each sit in one unit:

| `scope` | Reaches |
|---|---|
| `"placement"` | the records in the unit the person is placed in |
| `"placement_subtree"` | the records in the person's unit and in the units below it |
| `{ "scope": "unit", "anchor": "${param:<unit_ref parameter>}" }` | the records in one unit, which the admin picks when the app is installed |
| `{ "scope": "subtree", "anchor": "${param:<unit_ref parameter>}" }` | the records in that unit and the units below it |

`placement` and `placement_subtree` are relative to whoever acts, so one grant gives each person their own unit's
records, and a package needs no unit named in it. The other two name one unit through a `unit_ref` parameter
(`manifest.md`): a package never writes an organization's unit id, and the build refuses a scope anchored at anything
that is not a `${param:…}` of a `unit_ref` parameter. All four are refused on an entity that does not declare the member
(`entities/case.json#/access/grants/0/operations/0/scope: a grant scoped to a unit needs …`; `grant_unit_scope_unclassified`
at `lint`): the records of such an entity have no unit to match. `own` and `organization` name no unit and work on any
entity.

**Worked example: a court's cases.** The people in the users group see and change the cases of their own court; the
admins group sees every case. A user is placed in a unit by the organization, so the same package serves every court.

```json config
{ "requires_unit_classification": true,
  "access": { "mode": "restricted", "grants": [
    { "principal": { "kind": "group", "id": "${param:case_users}" }, "design": false, "operations": [
      { "operation": "read", "scope": "placement" },
      { "operation": "list", "scope": "placement" },
      { "operation": "create", "scope": "placement" },
      { "operation": "update", "scope": "placement" } ] },
    { "principal": { "kind": "group", "id": "${param:case_admins}" }, "design": false, "operations": [
      { "operation": "read", "scope": "organization" },
      { "operation": "list", "scope": "organization" },
      { "operation": "update", "scope": "organization" } ] } ] } }
```

- **A person with no placement reaches nothing** at `placement` or `placement_subtree`, and files no record. Say in the
  README that the organization places everyone in the users group in a unit before they use the app.
- **An unattended run's service principal needs a placement too.** A workflow a trigger starts runs as a service
  principal, which reaches records at `placement` only once an admin places it in a unit. Until then its steps find
  nothing to read or write; `lint` prints `unattended_placement_only` as a warning (`lint-problems.md`). Either place
  the principal, or give the automation group `organization`, and name the unit a record is filed in with
  `destinationUnit` on the step that creates it (`steps.md`, "The unit a created record is filed in").
- **Everyone is not a service principal.** A grant to `everyone` reaches active people only, so it does not help an
  unattended run.

## Record scopes

- `{ "kind": "field", "field": "<people field>" }`: the caller is in that field of the record. The field is
  a reference or reference list to Users, Groups or Units that the entity declares (not one its `work`
  seeds). A group in it stands for its members, and a unit for the people placed in exactly that unit.
- `{ "kind": "parent_field", "field": "<reference>", "parent_field": "<people field>" }`: the caller is in a
  people field of the record's parent. `field` is a single reference to another entity of the package.
- `{ "kind": "work" }`: the caller holds work on the record. The entity needs `work.assignable`.
- On `create`, only a `parent_field` scope is allowed.

No record scope tests what a record holds, such as "records with a service line": see "How to design access",
below, for the field that stands in for it.

## Fields only some people may read

A package never secures a field and never decides who reads one. Securing a field is the organization's
decision, made on AgentFlow's Field access page, where it also gives field security profiles to the users and
groups that may read or write the field. This is deliberate, not a gap to work around: any sealed package
installs, so a package that could grant access to a secured field would let its publisher decide who in the
organization sees that data. The install plan only warns; the admin decides. Mark the field `"recommendedSecured": true` (`entities.md`): the install
plan warns about it until the organization secures it. Say in the parameter help or the README which groups should
hold the profile.

- Once the field is secured, everyone else gets the record without it. One entity with a secured price does what
  a second, one-to-one entity holding only the price would, with one record to read and write.
- A workflow reads a secured field as the identity it runs as. One that runs as a service principal and lacks a
  profile with the field parks with `field_not_readable`, and the install plan lists it as a `run_identity`
  warning. Granting the profile does not resume the run: someone resumes it, and the resume checks again. One that
  runs as the initiator reads what that person may.
- A UI module reads as the person, so a figure it computes from a secured field is the person's to see.
- A secured field cannot be searched or faceted, and cannot be named in a record scope, a rule's actor test or a
  stage-model mover. A rule's field leaf may read it. Filters, sorts and dashboard tiles over it are refused to
  whoever cannot read it.

Mark the fields your module filters or sorts on with `"queriedByApp": true` (`entities.md`). Because the organization
decides who reads a field, any field the module queries may be secured later, and the screen built on it then fails to
load for the people who cannot read it. AgentFlow cannot see that from the module's code. The mark lets it warn the
admin who secures the field, on the field editor and the Field access page, and name your app, so the admin knows
that people who use the app must still be able to read it. It never stops the admin, and it is not a request to secure
the field: a field cannot carry both `queriedByApp: true` and `recommendedSecured: true`. Say in the README which
groups must keep reading the field.

## Worked examples

**One group, organization-wide, with changes limited to the opener.** The case desk
(`config/entities/case.json`): everyone in `app_users` reads, lists and creates cases, and changes the cases
they opened.

```json config
{ "access": { "mode": "restricted", "grants": [
  { "principal": { "kind": "group", "id": "${param:app_users}" }, "design": false, "operations": [
    { "operation": "read", "scope": "organization" },
    { "operation": "list", "scope": "organization" },
    { "operation": "create", "scope": "organization" },
    { "operation": "update", "record_scopes": [ { "kind": "field", "field": "opened_by" } ] } ] } ] } }
```

**Membership on the record, roles by group.** A team: an Everyone grant scoped to the team's own people
fields, then one group grant per role.

```json config
{ "access": { "mode": "restricted", "grants": [
  { "principal": { "kind": "everyone" }, "operations": [
    { "operation": "read", "record_scopes": [{ "kind": "field", "field": "managers" }, { "kind": "field", "field": "members" }] },
    { "operation": "list", "record_scopes": [{ "kind": "field", "field": "managers" }, { "kind": "field", "field": "members" }] },
    { "operation": "update", "record_scopes": [{ "kind": "field", "field": "managers" }] } ] },
  { "principal": { "kind": "group", "id": "${param:team_creators}" }, "design": false,
    "operations": [{ "operation": "create", "scope": "organization" }] },
  { "principal": { "kind": "group", "id": "${param:automation_group}" }, "design": false,
    "operations": [{ "operation": "read", "scope": "organization" }, { "operation": "list", "scope": "organization" }] },
  { "principal": { "kind": "group", "id": "${param:admin_group}" }, "design": false, "operations": [
    { "operation": "read", "scope": "organization" }, { "operation": "list", "scope": "organization" },
    { "operation": "update", "scope": "organization" }, { "operation": "delete", "scope": "organization" } ] }
] } }
```

**Membership on the parent.** An item reaches its people through its `team`, and names `assign` apart from
`update`, so only managers assign:

```json config
{ "access": { "mode": "restricted", "grants": [
  { "principal": { "kind": "everyone" }, "operations": [
    { "operation": "read", "record_scopes": [
      { "kind": "parent_field", "field": "team", "parent_field": "managers" },
      { "kind": "parent_field", "field": "team", "parent_field": "members" },
      { "kind": "field", "field": "collaborators" } ] },
    { "operation": "create", "record_scopes": [
      { "kind": "parent_field", "field": "team", "parent_field": "managers" },
      { "kind": "parent_field", "field": "team", "parent_field": "members" } ] },
    { "operation": "assign", "record_scopes": [{ "kind": "parent_field", "field": "team", "parent_field": "managers" }] },
    { "operation": "delete", "record_scopes": [{ "kind": "parent_field", "field": "team", "parent_field": "managers" }] } ] }
] } }
```

(Abridged: a full file also grants `list` and `update`, and grants to the automation and admin groups.)

## How to design access

1. Make a table: one row per entity, one column per operation (`read`, `list`, `create`, `update`,
   `assign`, `delete`), and in each cell who may do it.
2. **Membership** ("the people on this project") becomes one Everyone grant with `record_scopes` per
   operation: `field` for a people field on the record, `parent_field` for one on the parent.
3. **Organization-wide roles** ("project admins see everything") become a group grant to a group
   parameter with `"scope": "organization"`. Organization admins get nothing implicitly: give them a role
   group, and add it as a stage-model mover where they move records.
4. **Workflows a trigger starts** run as a service principal and need a grant to the group that holds it, for
   each operation their steps perform. A workflow people start runs as the person, who needs the grants for what
   its steps do.
5. Name `assign` explicitly wherever it differs from `update`.
6. What a grant cannot say (only the owner edits the title; a closed parent takes no new children) becomes a
   rule: see `rules-and-stages.md`.
   **Records only some groups see, by what the record holds** ("one team sees only the requests that need it")
   is not a scope: no scope tests a field's value. Give the entity a reference list to Groups (`visible_to`, with
   `group` in the manifest's `requires.entities`), let the workflow that sets the deciding value write the groups too
   (`bind("visible_to", lit(["${param:<group parameter>}"]))`), and give `read` and `list` through the Everyone
   grant with `{ "kind": "field", "field": "visible_to" }`. The field is data: whoever may update the record may
   change it, so guard it with a rule when people edit such records. The person who creates the record can pick the
   groups on the create form instead, with `x-entity: "group"` on the property (`entities.md`, "The create form").
7. Grants judge the stored parent. A person who may update a record and manages another parent can move
   the record there. Unless moving is a feature, fix the parent after create with a rule
   (`team_is_fixed` in `rules-and-stages.md`).
8. **People a step names need `read` on the record**, even when nothing else in the brief lets them see it. A Notify
   step tells no one who cannot read the record (`notifications.md`). A signer gets their task without a grant, but
   in an installed app's run the signing frame opens only for someone who may read every record the step read to
   prepare it, the run's record among them when a field names the signer (`signing.md`, "Where people sign"). The people
   a Human step is assigned to are the same: the task is theirs without a grant (it is in My Work for the people it
   names, who claim it and choose an action), but the record it is about opens only through the entity's grants, and in
   an installed app's run the task shows no value taken from a record they may not read. A
   screen that lists the records a person is named on needs `list` too. Give them `read` (and `list`) through a field
   record scope on the field that names them, in the Everyone grant: they read the records that name them and no
   others, and change nothing. For people a `group_ref` parameter names, add `read` to that group's grant. A person a
   `user_ref` parameter names has no grant of their own: put them in a field of the record, or they cannot read it.

## What a running app answers

When the installed app is tested as several people: a record outside the caller's record scopes answers
404, an operation no grant gives answers 403, and a rule refusal answers 422 `ENTITY_VALIDATION_RULE_FAILED`.
Test every cell of your access table this way.
