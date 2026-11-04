# Telling the assistant what is on screen, and opening it

A module offers the docked assistant a list of items describing what the person is looking at, and may open the
assistant with a question waiting. A module that sends a list or calls `open` declares `ui.contract: 4` (the
`agentflow-app-authoring` skill's manifest page), and an AgentFlow built before contract 4 refuses that package.
A module that offers one open record needs only `host.assistant?.setContext({ entity, record })` and contract 2
(SKILL.md, step 4).

## Send the list

```tsx
import { setAssistantContext, type AppAssistantItem } from '@reflexify/agentflow-sdk';

useEffect(() => {
  const items: AppAssistantItem[] = [
    { kind: 'record', entity: 'project', record: projectId },
    { kind: 'view', entity: 'task', filter: { field_filters: [{ field: 'status', op: 'in', value: ['todo', 'doing'] }] }, label: t('assistant.boardView') },
    { kind: 'rfx/projects:board-layout', label: t('assistant.boardLayout'), data: { groupBy: 'owner', completedWithinDays: 7 } },
  ];
  setAssistantContext(host.assistant, items);
}, [host, projectId, t]);
```

`setAssistantContext` sends the list to a host that takes one (`host.assistant.kinds` is present) and the first
`record` item alone to an older host, so no module writes that fallback. It never throws. Call it from an effect on
what the screen shows, as for `setContext`; the next call replaces the last, `[]` clears, and the same list sent
twice is told once, so a toolbar may call it on every change. Never clear it on unmount (the host does).

Items go most relevant first. AgentFlow keeps the first five. What a screen sends:

| On screen | Items, most relevant first |
|---|---|
| A task's drawer | `record` task |
| Text selected in a task's description or a comment | `text` (label "Selected passage", `from` the task), then `record` task |
| A board, searched or filtered | `record` project, a `view` of its tasks, an app kind such as `rfx/projects:board-layout` |
| Several cards selected | `records` tasks, then `record` project |
| A file | a `file` item, which the person includes, or `attach` from the button that asks about it ("Offer or attach a file", below) |

The kinds, and what each needs:

| Item | Shape | Notes |
|---|---|---|
| `record` | `{ kind, entity, record }` | `entity` is the key in your package, `record` an id |
| `records` | `{ kind, entity, records }` | ids; duplicates are removed and the first 50 kept, and the chip says how many were not attached |
| `view` | `{ kind, entity, filter, label }` | `filter` is a records search's `field_filters` and `ref_filters` (`records-api.md`); the assistant reads the count and the first 25 as the person |
| `dashboard` | `{ kind, dashboard }` | the dashboard's key in your package |
| `text` | `{ kind, text, label, from? }` | the app's own words; `from` is `{ entity, record }` when they are about a record |
| app kind | `{ kind: '<package>:<name>', label, data }` | `data` is JSON; the manifest declares the kind (below) |
| `file` | `{ kind, file }` | offered by `setContext`, copied at once by `open`'s `attach` ("Offer or attach a file", below); `file` is an attachment id |

AgentFlow names a `record`, a `records` selection and a `dashboard` itself, from what the person may read, so a
module cannot label one thing and attach another. A `view`, a `text` and an app kind carry your `label`. The
assistant reads each reference as the person: an item they cannot read is left out and the rest are offered.

## An "Ask AI" button

```tsx
{host.assistant?.open && <button onClick={() => host.assistant?.open?.({ prompt: t('ask.summary') })}>{t('ask.label')}</button>}
```

Show the button only where `open` exists: a host before contract 4 has none, and the standalone host has no
`assistant` at all. That is a capability the host lacks, so the button is left out; a control the person cannot use
at the moment (nothing selected to ask about) is locked with its reason instead (principle 5 of
`node_modules/@reflexify/agentflow-elements/DESIGN.md`). `open` does what the assistant's own button does: the dock opens with the items the screen offers
attached (a `file` stays offered), and the composer is focused. The `prompt` waits in the composer for the person to
send or change, and is never sent by itself. It goes in only when the composer is blank, so the person's own text wins.

`open` takes a gesture. Call it from the click or key handler that asked for it. A call from a timer, or from an
effect that ran long after the last click, is ignored with a console warning; a call from `mount` right after the
person clicked into the app is fine, because a click holds for a few seconds.

`attach` adds items for this one opening, after the screen's own, in the same shapes: `open({ prompt, attach: [{ kind:
'text', text, label }] })`. **You do not repeat the screen's items in it**: `open` already attaches every item
`setContext` holds (a `file` apart, below), so `attach` is for what belongs to this button alone, such as a text the
person selected or a file. An item is attached once even when the screen offers it too, and the total stays five.
The screen's items and `attach` are each attached as its name arrives, so an `open` made while the screen's names are
still being read still attaches them. A `setContext` or `open` made after it drops whatever of those is still
waiting: a module that opens and then changes the screen's items gets the new items offered, not attached.

## Offer or attach a file

```tsx
// The screen shows a file: offer it, and the person includes it when they want to ask about it.
setAssistantContext(host.assistant, [{ kind: 'record', entity: 'task', record: taskId }, { kind: 'file', file: fileId }]);

// A button that is about the file: copy it into the conversation at once.
const ask = (fileId: string) =>
  host.assistant?.open?.({ prompt: t('ask.taskFromFile'), attach: [{ kind: 'file', file: fileId }] });

{host.assistant?.kinds?.includes('file') && <button onClick={() => ask(file.id)}>{t('ask.taskFromFile.label')}</button>}
```

Show the `open` button only where `host.assistant.kinds` includes `file`. `file` is the attachment's id, the one the
record holds.

A `file` in `setContext` is offered, and the person decides. AgentFlow shows it above the composer as "Include this
file · `<name>`", beside the buttons for the screen's other items, and pressing it copies the file into the conversation
as a card, reading and then ready. The offer is hidden while the conversation holds a copy of the file, an unsent card
or a file already sent, and comes back when the card is removed. Opening the assistant copies no offered file: the "Ask
AI" button and `open({ prompt })` include the screen's other items and leave the file offered. A `file` in `attach` is
copied at once, so the dock opens with the file as a card in the composer and the `prompt` waiting beside it unsent.
Use `attach` for a button that is about the file, such as "Create a task from this file", and `setContext` for a file
the screen shows. Either way the card carries the file's own name, which the module cannot change.

The assistant reads the file as the person: the person must be able to open it, as they can when they download it.
A file they cannot open is not offered or attached. A file the assistant cannot take, over 20 MiB (5 MiB for an image)
or of a type it cannot read, shows as a refused card the person removes. The person's question and the other items go
through either way. A file counts among the five items one `setContext` or `attach` keeps; an included file
takes none of the question's five references, and a conversation takes five unsent files.

## The caps

The SDK exports each as a constant, so a module cuts on purpose instead of being dropped:

| Constant | Value | Over it |
|---|---|---|
| `APP_ASSISTANT_ITEMS_MAX` | 5 | the first five are kept, with a warning |
| `APP_ASSISTANT_RECORDS_MAX` | 50 | the first 50 ids are kept, and the chip says so |
| `APP_ASSISTANT_TEXT_MAX_BYTES` | 12288 | the item is dropped (UTF-8 bytes of `JSON.stringify(text)`, quotes included) |
| `APP_ASSISTANT_DATA_MAX_BYTES` | 4096 | the item is dropped (`JSON.stringify(data)`) |
| `APP_ASSISTANT_LABEL_MAX` | 80 | the item is dropped (characters) |
| `APP_ASSISTANT_PROMPT_MAX` | 2000 | the prompt is dropped and the dock still opens (characters) |

A text, data or a label is dropped and not cut, because cut mid-sentence it would read as the whole of what you
said. Cut it yourself where you know where a sentence ends.

## When an item is ignored

The host drops an item it cannot take with one console warning, `assistant.setContext: <reason>, so that item was
ignored` (`assistant.open:` for `attach`), and never throws. The reasons and the fix for each are in
`pitfalls.md`, "An item was ignored". A call whose every item is dropped clears the context.

## An app kind, end to end

An app kind is a name your package declares, with a skill that tells the assistant how to read the data. The
assistant loads that skill on the questions that attach the item, so the model reads your values correctly the first
time.

1. Write the skill (`agentflow-app-authoring`, `agents-and-skills.md`), say a file named `board_layout.SKILL.md`: what
   each `data` member means, which setting hides what, and what to tell the person. Write it for the assistant.
2. Offer it and declare the kind in the manifest. The kind's `skill` must be one `assistant.skills` lists:

   ```json
   "assistant": {
     "skills": ["board_layout"],
     "context_kinds": { "board-layout": { "skill": "board_layout" } }
   }
   ```

3. Send the item, named after your package: `{ kind: 'rfx/projects:board-layout', label, data }`. The name after the
   colon is the one you declared, lower case with hyphens.
4. Declare `ui.contract: 4`.

The assistant sees the `data` quoted as your app's, not as instructions, and the person can open the chip to read
exactly what will be sent. Keep `data` to the values the skill needs (an id, a date range, a draft), not prose a
`text` item would carry.

A date range in `data` is the module's own, so its days come from the browser's clock. AgentFlow counts a window such
as `within last_30_days` from the organization's day, and `host.context` has no time zone to align the two
(`records-api.md`, "Counting, and figures over many records"): have the skill say which days `data` holds and not
tell the person that they are the organization's last 30 days.

## A test host

A test host gives `assistant` the three members of contract 4. Use ids of the shape AgentFlow's records have
(UUIDs): the real host ignores anything else.

```tsx
import { vi } from 'vitest';
import type { AppAssistant, AppAssistantItem } from '@reflexify/agentflow-sdk';

const setContext = vi.fn<(items: unknown) => void>();
const open = vi.fn<NonNullable<AppAssistant['open']>>();
const assistant: AppAssistant = { kinds: ['record', 'records', 'view', 'dashboard', 'text'], setContext, open };
// host = { ...routedHost, assistant }; then assert on setContext and open.
const lastItems = () => setContext.mock.lastCall?.[0] as AppAssistantItem[];
```

Leave `kinds` and `open` out to test a host before contract 4: `setAssistantContext` then sends the first record
alone, and your button should not render. Leave `assistant` out to test the app's own site. `routes.md`, "A test
host", has the host with a working route.
