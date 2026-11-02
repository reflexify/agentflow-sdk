# Notifications: kinds and the Notify step

An app tells people about a record with a **kind** it declares in the manifest and a **Notify step** in a workflow.
Each person has two switches per kind: in-app (the bell, on to start with) and email (off to start with, unless the
kind says otherwise). A person can change them under AgentFlow's notification preferences, which list every installed
app that can tell them something, even one they cannot open, and the app's own module can show the same switches
(`agentflow-ui-module`, "Notification settings").

A package that declares `notifications` or holds a `notify` step needs platform `2026.11`. The builder raises
`minPlatformVersion` to `2026.11` for you (a later month stays). An earlier November build refuses the member, so
`lint` reports `notifications_platform_too_old` if you set it lower by hand.

## Declaring kinds

`notifications` goes in `config/package-manifest.json`, beside `launcher`:

```json
{
  "notifications": {
    "kinds": [
      {
        "key": "task_assigned",
        "label": { "en": "A task is assigned to me", "vi": "Có công việc giao cho tôi" },
        "title": { "en": "{actor} assigned you {record}", "vi": "{actor} đã giao {record} cho bạn" },
        "body": { "en": "In {app}", "vi": "Trong {app}" },
        "open": "/tasks/{{ record_id }}",
        "default_channels": ["email"]
      },
      {
        "key": "task_reopened",
        "label": "A task I follow is reopened",
        "title": "{actor} reopened {record}"
      }
    ]
  }
}
```

- **`key`**: a local key, as an entity's: lower-case letters, digits and `_`, starting with a letter, no `__`, at
  most 40 characters, unique in the member. A Notify step names it.
- **`label`**: what the person's switch is called. It is not the notice's text.
- **`title`** and **`body`** (optional): the notice's words. Each is a string, or a map from language tag to string,
  as a launcher entry's label is. A reader sees their language, then its base language (`vi-VN` reads `vi`), then the
  manifest's `contentLocale`, then the first tag, so a reader never gets an empty title.
- At most **50 kinds**. Per language, `label` is 1 to 60 characters, `title` 1 to 120 and `body` 0 to 500. When both
  `label` and `title` are maps, they must name the same languages; a single string on either side needs no agreement.
- **Placeholders** in `title` and `body`: `{record}` (the record's name), `{actor}` (the person who made the
  change; the app's name when nobody did) and `{app}` (the app's name). `{{` writes a literal `{` and `}}` a literal `}`. Any other `{…}` is refused,
  an unclosed one included. `label` takes no placeholder.
- **`open`**: a page of the package's module the notice opens at. It follows `work.module_page`: it starts with
  `/`, may hold `{{ record_id }}` (with its spaces) at most once, and needs the package's `ui` (`work.md`,
  "`module_page`"). Leave it out and the notice opens AgentFlow's own record page.
- **`default_channels`**: `["email"]` is the only value today. It means the kind emails a person until they turn
  it off; leave it out for a kind that only rings the bell. Choose it for a notice about the reader alone ("a task
  was assigned to you"), not for one that fires often or tells a whole group. The admin sees the kinds that email by
  default in the install plan, so a reader of that plan is not surprised. A person's own switch always wins over the
  default. In-app cannot be a default: it is on already.

A kind is part of the package, not an object: an upgrade replaces the list, and a kind a release drops is gone for the
next Notify step (below).

## Writing a Notify step

```js
import { notify, recipient } from "@reflexify/agentflow-app-builder/workflow";

notify("tell", "Tell the new assignee", "task_assigned", [recipient.field("subject.record.assignee")]),
```

`notify(id, name, kind, recipients, { except? })`. `recipients` has 1 to 10 sources and `except` 0 to 10. The sources:

| Source | Names |
|---|---|
| `recipient.field(path)` | the person, group or list in a field: `subject.record.assignee`, or a run value such as `input.reviewer` or `nodes.<id>.output.<member>`. A group is expanded to its members |
| `recipient.user(paramKey)` | the person a `user_ref` parameter holds |
| `recipient.group(paramKey)` | the group a `group_ref` parameter holds |
| `recipient.initiator()` | the person who started the run |

`recipient.user` and `recipient.group` write `${param:key}`, and the built package carries `@param:key`; declare the
parameter in the manifest. A person named twice (directly and through a group, or by two fields) is told once.
A field with no value names nobody, and the step still succeeds.

Write the step with these helpers. If you edit its parameters by hand, the build refuses a member the step
(`notification`, `recipients`, `except`) or a source does not have, so a misspelt `except` is caught rather than
leaving out nobody.

The step runs only in a workflow of the app's own package, never in a For Each body, and only in one whose Start names
a subject (`start({ subject: "${entity:task}" })`): the notice is about that record. Publishing refuses it anywhere
else. A kind the package does not declare is refused at build.

### "The people just added"

A notice for those a change added, not for everyone the field names, is the field as it is now **except** the field as
it was. The trigger maps the old value (note the double `event`), and the step subtracts it:

```js
// trigger config: only writes that change the field
config: {
  entity_id: "${entity:task}", change_kind: "updated",
  filter: { in: ["assignees", { var: "event.changed" }] },
  input_mappings: [{ from: "event.event.previous.assignees", to: "previous_assignees" }],
},

// workflow: start({ subject: "${entity:task}" }), then
notify("tell", "Tell who was added", "task_assigned",
  [recipient.field("subject.record.assignees")],
  { except: [recipient.field("input.previous_assignees")] }),
```

- **`previous` holds only what the write changed.** `event.event.previous.assignees` is the field's old value when
  the write changed it, and `null` (or an empty list) when it held no one before. A write that did not change it leaves it out, and a
  mapping that reads nothing maps to `null`. So keep the filter: without it, any other edit maps `null` and tells
  everyone in the field again.
- **`null` excepts nobody**, so the first people put in the field are all told.
- **The Start declares nothing for it.** A trigger's mapped values are the run's `input.*` whatever its Start says, so
  `start({ subject })` is enough. If the workflow has an `inputSchema`, though, declare the key there and let it be
  null (`previous_assignees: { type: ["array", "null"], items: { type: "string" } }`): the Start checks the input
  against the schema, and a run whose value fails it stops at its Start. With a schema, publish also refuses a
  template that reads an input key the schema does not declare.

### Who is the actor

The actor is the first of these that has anyone:

1. the person who completed the run's latest Human task;
2. the person whose write fired the run's record trigger (`trigger.actor_user_id`), grouped or not; a grouped
   trigger's batch adds the writer of every event in it, the newest event's first. A write by a workflow
   that runs as a service principal names nobody here (`workflows.md`, "What the run knows about the write");
3. the person who started the run.

A Notify step in a workflow another one calls (Call workflow) reads these through the calls: the latest Human task
of its own run, else of the nearest calling run that has one, then the trigger and the starter of the run at the top.
So a trigger → Call → Notify chain still leaves out the person whose write fired the trigger.

A schedule's run has no actor. `{actor}` in the words names the first of them. The actor is never told.

**A Signature step's signer is never the actor.** Its task is not a Human task, so a Notify step after it names
whoever the list above finds: the person who completed an earlier Human task of the run (a reviewer before the
signing, say), else the people whose write started the run, else its starter, else the app's name. The signer is told
like anyone else the step names. A Human step with `signing` is a Human task: the person who signs it is the actor.
So for a "signed" notice either sign with a Human step with `signing`, or word it without `{actor}`
(`"{record} is signed"`); no placeholder reads a person from a field. The choice has a cost: a Human step with
`signing` does not fail when its envelope fails: the run waits, and only a deadline moves it on, without telling a
failure from a late signer. A Signature step fails and can be routed (`signing.md`, "The two kinds of step").

### What is never sent

- to the actor;
- to a person who cannot read the record. This is judged after the change, so a person removed from a record usually
  cannot read it any more and is not told they were removed. Give everyone a step names `read` on the record, or
  they are skipped (`cannot_read` in the output): a field record scope on the field that names them, `read` in the
  grant of the group a `recipient.group(...)` parameter names, and, for a person a `recipient.user(...)` parameter
  names, a field of the record that holds them, since a package grants nothing to one person (`access.md`, "How to
  design access");
- twice for one step visit: a retry of the step adds nothing, and a loop's next visit to the step sends again;
- to anyone when the audience is larger than the platform's audience ceiling: nobody is told, and the step succeeds;
- to a person who turned off both of the kind's switches.

The step's output is counts only (`sent`, `excepted`, `actor`, `cannot_read`, `muted`, `suppressed`, and `simulated` in
a test run): it never returns who was told. A test run of the installed workflow's draft counts and tells nobody.

### A record deleted before the step runs

The step succeeds and tells nobody (`sent: 0`).

### A kind a release drops

The step looks the kind up in the installed package's manifest when it runs. A release that drops a kind makes the next
Notify step for it fail `NOTIFY_KIND_UNKNOWN`, so a workflow that stops telling people says so. Notices already sent
render with a fallback ("A notice from {app}") rather than vanish. Keep a kind's key for as long as a workflow sends it.

## AgentFlow's own notices are not deduplicated

The platform does not compare an app's notice with its own. Reopening a task already sends its holder AgentFlow's
"assigned to you", so a "task reopened" notice that names the holder too reaches them twice. Leave the holder out of the
app's notice: `except: [recipient.field("subject.record.assignee")]`. Check each kind against the notices AgentFlow
already sends for your entity's `work` (`work.md`).

## Before you hand off

- Every kind has a `label` and `title` in the languages your people read, with the same languages in both.
- `default_channels: ["email"]` only on a notice about the reader alone.
- A kind's `open` page exists in the module and opens the record whatever its status.
- A trigger that feeds "just added" maps `event.event.previous.<field>` and runs only when `event.changed` holds the field.
- Everyone a step names can read the record.
- Each Notify step's audience excludes whom AgentFlow already tells.
