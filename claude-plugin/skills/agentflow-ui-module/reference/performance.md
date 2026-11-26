# Pages that show quickly

What a module's page waits for, what a read costs, and how to order reads so a page shows its content first. The
figures were measured on one local AgentFlow stack (2027.08 and 2027.09) by one app; compare them with each other,
and measure on the deployment you ship to.

## Budgets

A page shows its content within 2.5 s of a first open, and within 1 s of a click between the module's own pages.
Name what "content" is for each page (its heading, its first row) and hold the budget on that. A skeleton after
150 ms and a spinner after 400 ms say the page is working; they do not make it quick. A page is settled when no
skeleton is left. That time matters, but it is not the first thing a person waits for.

## Measure before you change anything

A page's time is set by the requests it makes and the order it makes them in. Reading the code tells you neither how
long a request takes nor which one holds the others up. Keep a measurement in the project (`pnpm measure:pages`,
say), with its baseline beside it, and rerun it after any change to what a page reads.

- Drive a headless Chrome over the DevTools protocol (`--headless=new --remote-debugging-port=<port>` with a fresh
  `--user-data-dir`), so the measurement needs no new dependency. Sign in as a sandbox person the way `signInAs`
  does: `POST <AGENTFLOW_URL>/api/v1/auth/sandbox-session` with the person's token from `.agentflow/sandbox.json`,
  sent from a page on the web app's origin. Never print the token, the cookie or a query value.
- Per page, record the time to its content (an element inside the module's shadow root), the settled time, and
  every `/api/v1` call with its start and end (`performance.getEntriesByType('resource')`), grouped by kind: entity
  definitions, record reads, record queries, `/work`, `/app/objects`. Tell the module's calls apart from the host's
  (`/me`, `/notifications`, `/work/counts`, `/apps/launcher`, `/assistant`) and from the module's own files.
- Poll in short evaluations rather than one long one that waits for the page: a client's timeout cuts a long
  evaluate.
- Measure a first open (cold) and a return (warm, the module's files in the HTTP cache). Take the median of at
  least three runs, and record the load average with each run. Runs taken on a loaded machine were ten times worse
  and meant nothing, so refuse to measure above a load you set.
- Measure a click between pages apart from a first open: by then the module holds its data.

Keep a change only when its page beats its own "before" runs past their spread. A change that should help and does
not move the number is reverted.

## What a read costs

- **`include_capabilities` is the expensive part of a read.** AgentFlow judges each record's answers in a fixed
  number of statements per page (`records-api.md`, "What the person may do with one record"), but those statements
  read the rules, the work, the people and the stored bodies, and on the measured stack they made a read 8 to 34
  times slower: one record took 120 ms without and about 1.1 s with; a record of another entity 60 ms and 1.8 s;
  a list query 95 ms and 1.95 s. Ten such reads sent together each took 3.4 to 4.7 times as long as one alone. The cost
  grows with the number of entities that refer to the record's entity: each costs a door check and a scope read.
- **Over HTTP/1.1 the browser keeps six connections to the API's origin, and each shown AgentFlow tab holds one
  of them for its event stream** (`/events/stream`). That is a local stack or a
  plain-HTTP site; a TLS site behind the deployment's Caddy speaks HTTP/2, where one connection carries every
  request and a stream holds no slot. Over HTTP/1.1 a burst of slow calls fills the rest, and every read after it
  waits for a free connection, cheap or not. In one measured case ten slow calls held five connections for about
  2 s, and the page's own first read left the browser 1.9 s after the page asked for it.
- **On the measured local stack a page's time was close to the sum of its calls.** Ten identical 80 ms GETs finished
  in a staircase, 664 ms in all. Where that holds, the call count is the budget.

## Practices

1. **Ask for capabilities only on a read whose answer draws or locks a control.** A list the screen only displays (a
   switcher, a tree's labels, a queue, a count) reads without them. The record the page is about reads its own. A
   control on a list row (a row menu, a drag handle) takes its capabilities from the page read again with
   `include_capabilities` after the content is in (the flag is outside the cursor, so the same page comes back
   with its answers), never one record at a time. Until then the control is absent or pending, never shown as
   allowed.
2. **Render the page from its own reads.** Never hold a page's first paint on shell-wide data, such as every
   collection of a library or the person's whole work queue. What needs it (a full breadcrumb, mention titles,
   controls the shell decides) fills in when it lands.
3. **Order reads by what the person waits for.** Start the page's own reads first, and the shell's reads with
   capabilities after the page's content is in, so they do not hold the connections the page needs.
4. **Make fewer, wider calls.** One `GET /work` per `view`, keeping the app's lines by `entity_id`, is two calls
   where one per work entity and view is ten. Through an installed app, `/work` lists only entities the ceiling lets
   the app read and list, with a row's status, priority and clock fields readable. Bound how far you page, and say
   when the list was cut.
5. **Put no request behind another for a lookup.** Whether the deployment accepts `include_capabilities` is read
   from the first entity definition the module reads (`'create' in effective_capabilities`), once per mount, and not
   from each entity's definition before each GET.
6. **Load heavy code on demand.** A dynamic `import()` lands under `ui/chunks/`, which AgentFlow serves. A rich
   editor the module brought itself (the kit's `af-rich-editor` already loads its editor on demand) moved out of
   the entry this way cut the entry by about a tenth, and its 470 KB came only when a text was edited. Add a build
   test that the entry holds no marker of the library and exactly one chunk does. A
   minified build keeps no package names, so test for a string that survives it, such as a log prefix your own code
   defines.
7. **Abort reads the page no longer needs.** A read whose answer is dropped on unmount holds its connection until
   it ends. Pass a `signal` in the call's options (the client is openapi-fetch) and abort it on unmount.
