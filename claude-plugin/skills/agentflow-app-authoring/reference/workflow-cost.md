# Workflows that run fast

What a workflow run spends its time on, what grows with what, and how to lay out steps so a run is fast from its first
version. The figures are shapes measured on test builds against a test database. Compare them with each other, not
with times on your deployment. Most of a step's cost is database statements, so on a deployment whose database
answers more slowly every step is slower in proportion. Measure on the deployment you ship to.

## Rules of thumb

- **Visit fewer steps.** Judging a step's inputs costs close to a fixed amount for each step a run visits, whether
  its list holds nothing or hundreds of items. Writing still costs for each record a step writes.
- **In an all-or-nothing workflow, route by what the run will write**, such as the action a person took, so the run
  visits only the steps that can write something. A Decision before each step to skip an empty list costs more than
  it saves.
- **Write a list in one step**: `createMany` or `updateEach`, not a For Each, and one list per entity written the
  same way, merged in the Code step that builds it.
- **Keep work that must commit together in one workflow.** Splitting it into Calls adds steps and loses the
  all-or-nothing guarantee between the parts.
- **Put independent searches and reads in a Fork** in a step-by-step workflow, and never rely on the order of its
  arms.
- **Bind each step's output directly** into the step that reads it. Gathering values into a Set Variable step first
  makes the run slower, not faster.
- **Narrow at the source**: a search's `fields` and `limit`, a reference read bare as its id.
- **Give a Code step only the inputs `main` reads**, and do in one Code step what two would do over the same inputs.
- **Keep a Code step well under its time limit.** A timeout is retried, and your code runs again on every attempt.
- **Measure in a sandbox** on the deployment you ship to, with data the size you expect, and read the run's trace.

## What a step costs

In an installed app's run, every value a step reads carries everything it was built from: the records, fields and
rows behind it, called its sources below. A search's output was built from every field of every record it returned
(only the `fields` it names, when it names them), and a Code step's output from everything its inputs were built
from. Before a step uses a value, AgentFlow judges those sources again against what the run may read now, because a
grant can be revoked or a record moved out of reach while the run is going. That judging is most of an ordinary
step's cost, and it is done again by every step that reads the value.

The judging reads the run's access for all the entities a step's inputs name in a fixed number of batches, so:

- Judging costs about the same whether a step's list is empty or full. Writing does not: a step pays for each record
  it creates or updates, so a step that writes a hundred records costs many times what an empty one does.
- Inputs that name more entities cost only a few more statements. What grows with them is the work inside each
  statement.
- A search issues about the same number of statements whether it returns no record, three or forty. Its page is
  stored whole in the step's output, and every later step that reads that output reads all of it, so a wide record at
  a large `limit` is a large output (`runtime.md`, "A search's page").
- Each step judges for itself. Nothing one step checked is reused by the next, since a step's own writes can change
  what the run may read.
- A search's filters do not make it a lookup: a filter on a field is tested against the entity's records and narrows
  what comes back, not what is read. An admin can turn on Indexing for a field, which a deployment may then use for
  these filters, but a package cannot turn it on, so do not count on it. `getById` and `getByKey` (a natural key)
  always read one record by an index. On an entity that grows large, find a record by its key.

So the steps a run visits decide most of its time. In one measured all-or-nothing workflow, 12 steps took about half
as long as 23, and the run added little beyond its steps.

## All-or-nothing workflows

An all-or-nothing workflow (`steps.md`, "An all-or-nothing graph") runs as one pass in one database transaction, one
step at a time. A Fork there gives structure, not speed. Its arms still run one after another. The whole pass spends
one budget (`runtime.md`, "An all-or-nothing run's budget"), so its step count is also how close it runs to that
limit.

What makes a pass cheaper is visiting fewer steps:

- **A route per action.** When a workflow serves several actions, one Decision at the start on the action sends each
  to a route that holds only the steps that action can write. The Decision costs about one step, and the pass saves
  every step its route leaves out.
- **Fewer lists.** Lists that write one entity the same way can be one list. Build them as one in the Code step of
  the calling workflow, and write it with one `createMany` or `updateEach`. A merged `updateEach` list must name each
  record once (`ENTITY_RECORD_UPDATE_EACH_DUPLICATE`), so combine two changes to one record into one element. One
  step cannot write two entities, or create and update from one list.
- **A shorter pass holds its locks for less time.** A pass keeps every row it wrote, and any Auto Number series it
  took, locked until it commits. Another pass that needs one of them waits up to 3 seconds, then rolls back and starts
  again from Start (`runtime.md`, "An all-or-nothing run's budget"). So passes that write the same records at the same
  time wait on each other, and every step a pass leaves out shortens that wait.

What does not help:

- **A Decision before each step that skips the step when its list is empty.** The Decision reads the list, and reading
  it judges the same sources the step would have judged. Measured, 23 steps each behind such a Decision, 17 of them
  skipped, cost more than the 23 steps alone.
- **Splitting one route into several Calls.** The same steps run, plus a Call step and a Start for each part, which
  judge the inputs again, and each part waits for a worker to start it. The parts also do not commit or roll back
  together.

## Fork independent work in a step-by-step workflow

A step-by-step run starts a ready step as soon as there is room for it, up to the deployment's limit on steps one run
works on at once, 8 by default. So the arms of a Fork run at the same time. In one measured shape, 24 searches (4
returning about 40 rows, 8 returning 3, 12 returning none) took about two-thirds as long in a Fork as in a chain, for
about the same number of statements.

- **The arms run in no order.** A step in one arm may run before, during or after any step of another. A step that
  needs another arm's result, such as a search for a record that arm writes, goes after the Join (`workflows.md`,
  "Parallel arms: Fork and Join").
- **A Join waits for every arm**, so the slowest arm sets when the run goes on.

## Values between steps

- **Bind outputs directly.** Every variable a Set Variable step writes carries everything that step read, so copying
  many outputs into variables makes each variable carry all their sources. Measured, gathering 27 outputs into
  variables and reading them in a Code step issued about five times the database statements (96 against 18) and
  took more than ten times as long (in a debug build) as binding the 27 outputs straight into the Code step's inputs. The Code step judges
  each of the 27 variables against the sources of all 27 outputs.
- **Read a reference bare.** `subject.record.item` is the item's id. A longer path, `subject.record.item.name`, reads
  the item too, and adds it to the sources of every value built from that read (`workflows.md`, "The helpers").
- **A Call gives each input only its own binding's sources.** Each input of the called workflow carries the sources
  of the values its binding read, and no other's. Inputs bound from one Code step's output all carry everything that
  Code step read, and every step of the called workflow that reads one judges all of it.
- **A Call is a run of its own**, with its own Start and End. It waits in the queue for a worker to start it, and
  when it ends, its caller waits in the queue again to go on. Use one to share a workflow or to make part of the work
  all-or-nothing, not to break up a long route.
- **A For Each runs each item as a run of its own**, which waits for a worker to start it as a Call does. When the
  work per item is only writing records, `createMany` or `updateEach` writes the whole list in one step. When it is
  more, leave `mode` at `parallel` unless the items must run in order. `sequential` starts an item only once the one
  before it has ended.
- **A run for one record of a selection reads its record against the whole selection.** A record action over a
  selection starts one run per record. Each such run's `subject.record` carries what chose the selection, which names
  every record in it, so every read of it costs more the larger the selection, and the run reads its record only while
  it may read every record selected.

## Code steps

A Code step's time is in its trace as `phases` (`runtime.md`, "What a run's times say"). Each part has its own cause:

- **`inputs_ms`** is reading and judging the step's inputs. It grows with the records and fields the inputs were
  built from, not with how many entities they name. Bind only what `main` reads, and narrow a search with `fields`
  before a Code step reads it.
- **`runner_wait_ms`** is waiting for room at the deployment's code runner. More than a few milliseconds means the
  runner was busy with other steps. The app cannot change that limit.
- **`create_ms` and `ready_ms`** are starting a fresh sandbox, which every Code step does every time it runs. On some
  runners this takes seconds and is most of the step. On others it takes milliseconds. Read it on your
  deployment. Where it is large, one Code step that does the work of two saves a sandbox. Its output then carries
  everything both read.
- **`run_ms`** is starting the interpreter and running `main`.

Failures cost time too. A step that runs past its time limit (`CODE_EXECUTION_TIMEOUT`) or meets a runner fault
(`CODE_RUNNER_FAILED`) is retried: 3 attempts in all, or 4 when the first ran in a start that waited for its answer
(`runtime.md`, "A Code step's time limit"). Code that always runs past its limit runs on every attempt, so it takes at
least three times the limit before the run fails, and the run records no `error_detail` for a timeout. Your program's
own failure (`CODE_EXECUTION_FAILED`) is not retried. After a runner fault, the run's `error_detail` says whether it is
safe to start the work again: `code_not_run` means no attempt started the program, and `code_outcome_unknown` means one
may have, so an effect outside the run may already have happened. Make such effects idempotent, keyed on
`context.run_id` (`workflows.md`, "Code steps"). Starting the work again means retrying the failed run: an admin, or
whoever started the run, sends `POST /instances/{id}/retry`, which attempts each failed step again on the run's own
version and never runs a step that completed. A trigger does not fire twice for one change, and a retry helps only
when the cause has passed; a fault in the app needs a new release and a new run.

A Code step cannot run in an all-or-nothing workflow. Run it in the step-by-step workflow that calls one, and pass its
result in.

## Finding where the time went

Read a run's times as a person who may read the run, such as the sandbox's owner. An installed app's own token is
usually refused `GET /instances/{id}` (`APP_CEILING_DENIED`), and through an app a run about a record is traced only
while the app may read the record (`sandbox-testing.md` of the `agentflow-app-release` skill, "When a run fails").

- **`GET /instances/{id}/trace`** gives each step `ready_at`, `started_at` and `completed_at`. `started_at` less
  `ready_at` is the wait for a worker, and `completed_at` less `started_at` is the step's own work. A Code step also
  carries `phases`. They are durations only, so an installed app's run tells them where it withholds the step's
  input and output (`runtime.md`, "What a run's times say").
- **`queued_ms`** on `GET /instances/{id}` is the wait from the run's cause to the platform's first work on it,
  `first_tick_at` less `triggered_at`. A run another run started has neither time, so it has no `queued_ms`.
- **Time an all-or-nothing pass from the event stream.** Every time the pass stamps on its steps, its records and the
  run's `timeline` is the moment its transaction opened, so neither the trace nor the timeline can say how long it
  worked. An event's `occurred_at` on `GET /events` is the moment the event was written (`runtime.md`, "Times inside
  an all-or-nothing run"):
  1. Before you start the run, call `GET /events` with no `after`. It returns no events, only the current position.
  2. Once the run ends, call `GET /events` with that position as `after`, `types=instance.started`,
     `types=instance.completed` and `include_child_runs=true`. A called run's events come only with
     `include_child_runs=true`.
  3. For a run nothing called, its `first_tick_at` on `GET /instances/{id}` to its `instance.completed` is how long
     it worked. A called run has no `first_tick_at`: its `instance.started`, written when its caller created it, to
     its `instance.completed` is its wait for a worker and its pass together.

  To compare layouts, time the pass with each.
- **Measure on realistic data.** Judging costs the same for an empty list as for a full one, but a write grows with
  the records it writes, and a stored search page with the rows it holds. A pass that is quick on test data can run
  near its budget on a busy deployment (`runtime.md`, "An all-or-nothing run's budget").
