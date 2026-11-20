# Time and limits at run time

What a running workflow may spend, what its times mean, and where to look when it stops. The numbers are the
platform's defaults. Where a number is a deployment setting, an app cannot change it, and a deployment may set
another value.

## An all-or-nothing run's budget

An all-or-nothing workflow (`graph(..., "atomic")`, `steps.md`) runs as one pass inside one database transaction.
The pass has a wall-clock budget: 120 seconds, the deployment's `ATOMIC_RUN_BUDGET_MS`, at most 10 minutes. It is
set per deployment, not per workflow or package. A pass that runs out of it is rolled back, and the run fails with
`ATOMIC_BUDGET_EXCEEDED`. It is not retried: a second pass would take as long.

Everything the pass does spends the budget:

- The clock starts before the transaction opens, so waiting for a database connection counts.
- Every statement of every step, one step at a time: a pass runs its steps one after another, never in parallel,
  and every lap of a loop runs in the same pass.
- Waiting for a row another transaction holds, up to 3 seconds per wait (`ATOMIC_LOCK_TIMEOUT_MS`). Past that the
  pass is in contention: it is rolled back and starts again from Start with a fresh budget, up to 3 more times
  (`ATOMIC_CONTENTION_RETRIES`), and then the run fails with `ATOMIC_CONTENTION`.
- A database busy with other work, which makes each statement slower.

So a pass that takes most of the budget alone runs over when it shares the database: a second all-or-nothing run at
the same time, a load, or a busy stack. Measure your largest pass on data the size you expect, and keep it well
under the budget. A record action over a selection starts one all-or-nothing run per record, each with its own
budget, so a member that fails rolls back only itself; an action whose workflow takes the whole set starts one run
over all of it.

The failure is written after the rollback, in a transaction of its own. A statement still running when the clock
ran out goes on until it ends first, so a failed run's `completed_at` reads past the budget, by up to one more
budget.

While the pass runs, every row it wrote or locked stays locked: a person who edits one of those records waits until
the pass ends, and so does anyone creating a record of an entity whose auto number the pass took.

## Times inside an all-or-nothing run

Inside the pass, every time the database stamps on a record, a step or the run is the moment the transaction
opened, not the moment of the write:

- a record's `created_at` and `updated_at`, the triggering record's included when the pass writes it;
- each step's `ready_at`, `started_at` and `completed_at` in the trace and in `node_runs[]`;
- the run's own `completed_at` when the pass commits, a called all-or-nothing run's included.

So a pass that wrote for 100 seconds shows every step at one instant, and when the first pass commits, its
`completed_at` reads a moment after `first_tick_at`. Neither says how long the pass took.

These times are real:

- The run's `triggered_at`, when its cause happened, and `first_tick_at`, when the platform first worked on it (both
  on `GET /instances/{id}`). A run another run started has neither.
- The run's `started_at`, written before the pass in a transaction of its own. For a called all-or-nothing run it is
  the only real time of the run's start.
- A failed run's `completed_at`, written after the rollback.
- Each event's `occurred_at` on `GET /events` and in a webhook delivery. An event is stamped when it is written,
  inside the pass too, so `record.created` and `record.updated` carry the time of each write, and
  `instance.completed` the time the pass finished its work. For a real duration, read the events, not the run's
  `timeline`, whose entries the pass stamps with its own start. From `first_tick_at` to `instance.completed` is how
  long the run worked. A called run has no `first_tick_at`, and its events come only with `include_child_runs=true`:
  from its `instance.started`, written when its caller created it, to its `instance.completed` is its wait for a
  worker and its pass together (`workflow-cost.md`, "Finding where the time went").

To record a time inside the pass in a field, write `{{ now() }}` into it from a step: a template's `now()` reads the
clock when that step runs.

## What a run's times say

`GET /instances/{instance_id}/trace` gives each step `ready_at`, `started_at`, `completed_at` and `attempts`:

- `started_at` less `ready_at` is how long the step waited for a worker.
- `completed_at` less `started_at` is the step's own work, from the moment a worker took it to its end.
- A step's times span all its attempts: `started_at` is the first attempt's and `completed_at` the last one's. A
  step that failed and was retried shows `attempts` above 1, and its span holds every attempt and the wait between
  them. Each attempt's own times are in `node_runs[]` on `GET /instances/{id}`, one entry per attempt.

A Code step's own work holds more than running `main`:

1. resolving its inputs: rendering each template, and reading a file's text through `content(...)`;
2. waiting for a free place at the deployment's code runner;
3. starting a sandbox and waiting for it to answer;
4. uploading the program, with the inputs inside it;
5. running `main`;
6. reading the answer.

A Code step on the trace, and each of its attempts in `node_runs[]` on `GET /instances/{id}`, carries `phases`: how
long each part took, in milliseconds, for the step's last attempt on the trace and for that attempt in `node_runs[]`.

- `inputs_ms` is part 1.
- `runner_wait_ms` is part 2. More than a few milliseconds means every place the process had at the runner was busy.
- `create_ms` and `ready_ms` are part 3. What a new sandbox costs depends on the deployment's code runner. Measured
  on a trivial step, one runner took about 2.3 seconds, nearly all of it `create_ms`. Another took about 80
  milliseconds, about 15 of them creating the sandbox.
- `upload_ms` is part 4.
- `run_ms` is parts 5 and 6, and so includes starting the interpreter. Where the sandbox starts in milliseconds,
  `run_ms` is most of a short step.

A part the attempt never reached is absent, so a step whose sandbox could not be created has no `upload_ms`. They
are durations only, so they are told on an installed app's run where the step's input and output are withheld.

For an attempt that ran straight through, what `phases` leave out of `completed_at` less `started_at` is the
platform's own work around the step. The span holds more in two cases, and what it adds is in no phase:

- A step whose `content(...)` asks for a file's text before the text is extracted stops, waits for the extraction,
  and then starts again from the beginning. `started_at` stays at its first start, so the wait is in the span, and
  `inputs_ms` covers only the last start, when the text was ready.
- On the trace, a step with `attempts` above 1 spans every attempt and the waits between them, and its `phases` are
  its last attempt's alone. To compare them with one attempt's span, read that attempt in `node_runs[]`.

Only part 5 counts against the step's time limit (below). `run_ms` is an upper bound on how long your code took; for
the figure itself, measure it inside `main` and return it as an output member.

## A Code step's time limit

`code(...)` writes the step with `timeoutSecs: 10`, so the code may run 10 seconds. Ask for another number with its
last argument, `code(id, name, file, inputs, outputSchema, { timeoutSecs: 20 })`. The step gets at most the
deployment's ceiling: 20 seconds by default, `CODE_RUNNER_BUDGET_SECS`. A larger value builds and is cut to the
ceiling, and an app cannot raise it. `build` refuses a `timeoutSecs` that is not a positive whole number of seconds.
A Code node written by hand with `node(id, name, "code", { ... })` and no `timeoutSecs` gets the ceiling.

The clock covers running the program, not starting the sandbox or uploading it. Past it the step fails with
`CODE_EXECUTION_TIMEOUT`. AgentFlow treats that failure as transient, so the run tries the step again, 3 attempts in
all, and runs your code again each time. Code that always takes too long fails after the third, with `attempts: 3`.
One case can take a fourth: a start that waits for its answer (`wait_ms`) runs the run's first pass in the request,
and a step that fails in that pass has used one attempt before a worker gives it its 3. A step set to `continue`
takes its stand-in output at the first failure instead (`workflows.md`, "When a step fails: an error strategy").

## What a rolled-back run keeps

An all-or-nothing run that fails is rolled back whole, and its steps' rows (`node_runs`) go with it. A step row that
survived would make a retry start at that step without the outputs of the steps before it, which were rolled back.
So a rolled-back run has no failed step, and its trace has no steps.

What it keeps:

- The run itself, `failed`, with `error_code` and `error_meaning`: the failed step's code, or `ATOMIC_BUDGET_EXCEEDED`
  or `ATOMIC_CONTENTION`. Every reader sees both, and `error_detail` where the failure has one and the reader may read
  the definition of each entity it names: the step, and why in names from your config (`pitfalls.md`, "A failed step's `error`, or the run's `error_message`, reads
  `null`").
- An `instance.failed` event in the run's `timeline`, whose payload names the step in `node_id` and carries
  `code`. A pass cut off by its budget names the step that was running.
- `last_rollback` on `GET /instances/{id}`: the step's id and label, the code, the message, and the steps the
  attempt visited, each `completed` or `failed`, at most 200. The run's `error_message` says that nothing was saved,
  and names the step and the reason. In an installed app's run both are withheld, like the run's other
  text (`sandbox-testing.md` of the `agentflow-app-release` skill, "When a run fails"), so there the event's
  `node_id`, the run's `error_code` and its `error_detail` are what name the failure.

A run another workflow called is not in `GET /instances`, which lists only runs nobody called. When it is about a
record, find it among that record's runs, `GET /entities/{entity_id}/records/{record_id}/runs`, which lists called
runs too, then read it with `GET /instances/{id}`. Its caller lists it in `for_each_children[]` as well, under the
Call step's id in `parent_node_id`. When it fails, its caller's Call step fails at once with the called run's
`error_code`, unless the step is set to `continue`, which goes on with its stand-in. The calling run then fails with
that code and the called run's `error_detail`, naming the Call step; a cancelled one fails the step
`SUBWORKFLOW_CANCELLED`. The called run's own detail keeps the step that failed in it and the record's position
(`workflows.md`, "Calling another workflow: `call`").

Retrying a rolled-back run starts it again from Start.

## A search's page

A search step returns at most `limit` records: 10 when you leave `limit` out, and at most 5000. A larger `limit` is
cut to 5000 without a warning. The output's `returnedCount` says how many came back, and `hasMore` is `true` when
more matched than the page held. A step cannot ask for the next page: narrow the filters, or sort so the records
you need come first.

The whole page is stored in the step's output and read again by every later step, so a wide entity at 5000 records
is tens of megabytes per run. Give the search `fields` with only what the run reads.

## Business days and the organization's time zone

`add_business_days(value, n)` counts `n` working days from `value`, on the organization's business calendar: its
working days (Monday to Friday until an admin changes them) and its holidays. Zero is `value` itself, even on a
Sunday. A negative `n` counts back. It works in a workflow step's templates only; a formula cannot call it.

It counts on the calendar date `value` is written in:

- A date (`2026-11-16`) gives a date.
- A date and time keeps its time of day and its offset, and counts from its own date. `now()` is written in the
  organization's time zone (`2026-11-16T09:30:12.345+07:00` in Asia/Ho_Chi_Minh), so
  `add_business_days(now(), 3)` counts from the organization's date.
- A time stored in UTC (`2026-11-15T23:00:00Z`) counts from its UTC date, which east of UTC can be the day before
  the organization's. Turn it into the organization's date first with the `date` filter:
  `{{ subject.record.<field> | date | add_business_days(3) }}`.

The time zone is the business calendar's, which an admin sets for the organization. It is UTC until one does, and a
sandbox takes `settings.timezone` from `sandbox.json`. The `date` and `datetime` filters read the same zone.

## Elsewhere

- What makes a run slow, and laying out its steps so it is fast: `workflow-cost.md`.
- Which refusal a write meets first, a stage model's or a rule's: `rules-and-stages.md`.
- What `GET /work` lists, and listing the work a person may assign: `work.md`.
- Testing a workflow a schedule starts: `sandbox-testing.md` of the `agentflow-app-release` skill.
