# After `deploy`: reading a deployment, and which checks are yours

`deploy` ends at `awaiting approval`, and the admin does the rest. This page is for the time after: what became of
the deployment, and which checks of the installed app a key can make.

## Reading a deployment's state

The CLI has no command for it. Its only way to ask is `deploy`, and `deploy` can start a new deployment (next
section). Read one with the SDK's client and the deploy key (these routes need `integration.admin`). The id is
`deployment.deployment_id` in `deploy --json`.

```ts
import { bearerAdapter, createAgentFlowClient, ok } from '@reflexify/agentflow-sdk';

const key = process.env.AGENTFLOW_TOKEN ?? '';
const client = createAgentFlowClient({ baseUrl: `${process.env.AGENTFLOW_URL}/api/v1`, auth: bearerAdapter(async () => key) });
const id = process.argv[2] ?? '';  // argv[3]: the package id
const list = await ok(client.GET('/app-deployments', { params: { query: { q: process.argv[3] ?? '' } } }));
const found = list.items.find((d) => d.deployment_id === id);
console.log(found?.status, found?.installation_id, found?.app_key, JSON.stringify(found?.problem));
```

- The key comes from the environment, as for the CLI (`read -rs AGENTFLOW_TOKEN`); never write it into the script.
- `baseUrl` is **`<AGENTFLOW_URL>/api/v1`**. The CLI adds `/api/v1` itself; the client does not.
- `status` is `awaiting_approval`, `installing`, `installed`, `failed` or `cancelled`; a cancelled one has
  `status_reason`, `withdrawn` or `superseded`. `installation_id` and `app_key` are set once it is `installed`.
- `problem`, for a `failed` one, is `{ type, title, status, detail }`: `type` is the code the install run was recorded
  with (`APP_RELEASE_UNAVAILABLE`, `APP_SETUP_INCOMPLETE`, `APP_ARM_REFUSED`, `APP_INSTALLATION_EXISTS`, `APP_PLAN_CHANGED`,
  `APP_PRECONDITION_CHANGED`, `APP_CATALOG_VERSION_WITHDRAWN`, a refusal's own code, or `INTERNAL_ERROR`), and `detail` is only `the install run <run id> failed`. It never says
  why. The cause is in the server's log, and in what the admin saw on the setup page (`refusals.md`).
- The snippet reads the list, `GET /app-deployments?q=<package id>` (the organization's deployments, waiting ones
  first), because `GET /app-deployments/{deployment_id}` loads and verifies the release again: when the release is gone
  or no longer verifies, which is most of what `APP_RELEASE_UNAVAILABLE` means, that route answers 409
  `APP_RELEASE_UNAVAILABLE` and no status. The list does not load the release. Lost the id? The list shows it.

## `deploy` after a failure makes a new deployment

After a deployment is `failed` or `cancelled`, `deploy` is not a status check: it requests the install again, which
makes a new deployment that awaits approval again, and an admin can approve it before anyone has fixed the cause. So:

1. Read the deployment's state (above), and the admin's report if they approved it.
2. If it is `failed`, look its `type` up in `refusals.md` and fix the cause first. The plan findings
   (`APP_STEP_FAILED`, `APP_DEPENDS_ON_FAILED`) are never a deployment's `type`: they block approval and show on the
   setup page.
3. Only then `deploy` again. A release that is already `installed` answers `installed` and changes nothing.

## Which checks after the install are yours

- **Acting as a person is not yours.** A key is a service principal, with no user identity. Claiming work, listing
  `GET /work`, releasing, and submitting a step all answer `USER_IDENTITY_REQUIRED` to a key, so a key cannot start a
  record as a staff member, claim its task as a manager, or decide it. In the real organization that check is the
  admin's, or a person's with their own sign-in: ask them to start one record, decide its task, and say what the
  record shows. The place to test the flow itself, as people, is a sandbox (`sandbox-testing.md`: `as(handle)`).
- **A key can create records**, with `POST /entities/{entity_id}/records`. That tests that a trigger starts a run,
  and nothing about who sees what: such a record has no creator, so a `creator` default stays empty (`entities.md` in
  the authoring skill, `default`).
- **A key cannot tell whether a trigger is on.** The trigger ships off and an admin turns it on (`admin-message.md`).
  No published route reports it: arming and an installation's object listing are person-only
  (`USER_IDENTITY_REQUIRED`), and the listing's `state` is `live`, `deprecated` or `off` for an optional feature, not
  whether a trigger is armed. `GET /instances` shows only the runs that already started, so "no run yet" is the same
  whether the trigger is off or the record came too soon.
- **A trigger starts runs only for changes made after it is on.** The dispatcher applies the trigger's activation
  time and settles an earlier event as matching nothing: for a `created` trigger, a record made before the admin
  turned it on is never picked up later; for an `updated` trigger, an older record that changes after that does start
  a run. Ask the admin to tell you when it is on, make the first records after that, and look in
  `GET /instances` for the runs they start.
