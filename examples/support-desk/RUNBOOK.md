# Support desk runbook

This takes an empty organization to a working support desk. Steps 2 to 7 are things only a person can do: the email connection, the people and their groups, and the automation principal. Step 8 builds the desk as a signed package, deploys it for an admin to approve and, once step 10 has made the autopilot rules, turns its triggers on. Each step says where to click and what to copy. A copied id is an install parameter (named in code), and an id is in the address of the page that shows its object.

Steps 1 to 12 set up the ticket app, which has no screens of its own. **The desk**, at the end of this file, is the app people work in; it takes the ids this part produces.

## 1. Before you start

- The API and the worker both run this release.
- `CODE_RUNNER=opensandbox` is configured with its URL and key, because Intake's three Code steps and Move's one need it. Without it the install is refused.
- `HTTP_PUBLIC_BASE` is an `https://` address. Connecting Resend registers its webhook there.
- The LLM providers named in `support_model` and `triage_model` are configured. The install is refused when either is not.
- `APP_GRANT_SOURCE_WRITES_ENABLED=true` for the API and every worker, which the operator sets only after recording the grant-source gate. The desk's entities write grants the installation owns, and without the flag the install is refused `APP_GRANT_SOURCE_WRITES_DISABLED` before anything is written.
- You have the SDK workspace, with Node 22.12 or later and pnpm 12 (`pnpm install` run in its root), to build and seal the package, a service principal key (`afk_…`) of a principal that holds `integration.admin` in `AGENTFLOW_TOKEN`, and the deployment's address in `AGENTFLOW_URL`. An admin of the organization approves the install.
- The organization is new to this app. The plan is refused when another agent in the organization already holds the name Support agent or Triage agent (names are compared ignoring case). An organization that an earlier release's installer set up holds both, and its records cannot move into a package, so use a new organization. The old one keeps working as it is.

## 2. The email connection

1. In **Admin → Integrations**, connect **Resend** with a full-access API key (a sending-only key is refused), and set the default From and Reply-To.
2. Verify the sending domain in Resend.
3. Set the connection's inbound (receiving) domain, for example `support.example.com`. Customers write to `support@` that domain, and every reply we send names `support+<ticket number>@` that domain as its Reply-To.
4. Copy the connection's id: `resend_connection_id`.
5. Point the domain's MX at Resend.

## 3. The support groups, their role and their people

1. In **Admin → Groups**, create **Support** and add the support team. Copy its id: `support_group_id`.
2. Create **Support admins**: the people who may switch an autopilot rule on or change its mode. Add them to Support as well. Copy its id: `autopilot_admin_group_id`.
3. In **Admin → Roles**, create a role **Support** with `entity.read`, `entity.list` and `entity.write`, and nothing else. Grant it to every person of both groups: open the person in **Admin → Users** and add it under their roles. A role does not come from a group, so a person added to a group later needs it too.

The entity routes check those three permissions before they look at any grant on an entity. Without the role a person gets 403 on every ticket, and Send, Accept and Move, which run as the person, fail. A Support admin needs nothing more than the same role: the grant on Autopilot rule is what lets them write a rule. Starting a workflow takes no permission. Send, Accept, Move and Draft reply each name the Support group in their start access, and a place in the group is enough.

**Never grant `workflow.start.any` to support people.** It skips every workflow's start access, so a person could start Send's claim step directly, with any recipient and any text, and the desk's other internal workflows with it.

## 4. Four unit pools

In **Admin → Organizational units**, create `Support low`, `Support normal`, `Support high` and `Support urgent`. Place each person in the units whose tickets they take. Handling opens each ticket's "Handle ticket" task in the pool of its priority, so a person placed in none of them has no task to take.

Copy the four ids: `unit_low`, `unit_normal`, `unit_high`, `unit_urgent`.

## 5. No relay principal

The desk once read the ticket app's data through a read-only service principal. It now reads AgentFlow's event stream as each person, so the ticket app has no such principal and its install takes no `relay_principal_id`. An organization installed before this change still has the **Support desk relay** principal and its grants: deactivate it in **Admin → Service principals** and revoke its key, since nothing uses them.

## 6. The automation principal

The unattended workflows run as this principal: Intake, Draft on customer message, Handling, the three Delivery workflows and Close idle tickets. No person starts them, and a trigger has no initiator.

1. In **Admin → Roles**, create a role with `entity.read`, `entity.list`, `entity.write` and `workflow.start.any`.
2. In **Admin → Service principals**, create **Support desk automation**. Grant it that role and add it to the Support group. Issue it no credential: it never signs in.
3. Copy its id: `automation_principal_id`.

## 7. The organization's business calendar

In **Settings → Organization → Business calendar**, set the working week, hours and holidays. Close idle tickets counts its business days, and each priority's SLA counts its business hours. Until it is set, the default applies: Monday to Friday, 09:00 to 17:00 UTC, no holidays.

## 8. Install

The desk is the signed package `rfx/support-desk`. Items 1 to 5 put it in the organization. Item 6 turns it on, and it comes after step 10.

1. **A signing key.** The package is sealed with a key of yours: make one with `pnpm exec agentflow-app keygen --key-id <id>` (from the desk's folder; it writes `keys/<id>.pem`), and keep the file out of version control and out of `.env`. Nobody has to trust the key: the admin's approval in step 5 is the only gate.
2. **The organization.** Any organization may upload the package; there is nothing to enrol and no key to add before the upload.
3. **Build the package.** From the desk's folder:
   ```bash
   pnpm pack:app
   ```
   It builds `package/` and the desk's UI into `package/ui/`, and seals them with the one key in `keys/`, writing `dist-app/rfx-support-desk-1.0.0.afpkg` (about 0.8 MB). To use another key, add `--key /path/to/key.pem --key-id <id>`. Sealing the same package again leaves the archive as it is, and a changed package under the same version is refused (`SEAL_OUT_EXISTS`): raise `version` in `config/package-manifest.json`. After any change under `config/`, `pnpm build:package` writes `package/` again, and `pack:app` does it for you.
4. **Fill in the parameters.** Copy `parameters.example.json` to a file outside the project, and fill in the ids from steps 2 to 6 (`support_group_id`, `autopilot_admin_group_id`, `automation_principal_id` and the four `unit_*`), plus:
   - `resend_connection_id`: the pair `{"provider": "resend", "externalAccountId": "<the connection's id>"}`. The connection's id is in the address of its page in **Admin → Integrations** (step 2.4), and for Resend it is the account. Give it inside the pair: a bare id is read as a row id, and the plan fails with `APP_REFERENCE_UNRESOLVED`;
   - `inbound_domain`: the domain from step 2;
   - `our_domains`: every domain you send from or receive at, separated by commas. Intake leaves these addresses out when it checks who may write on a ticket;
   - `company_name`: the name in the line an automatic reply ends with when the autopilot rule's `disclose` is set, "This reply was written by <company_name>'s AI assistant.";
   - `support_model` and `triage_model`: the two models, as `provider/model`;
   - `timezone`: an IANA name. Close idle tickets runs daily at 06:00 in it. This sets the hour that schedule fires and nothing else. The business calendar's zone (step 7) is a separate setting, and it is the one that counts business days, for the 7 days before a ticket closes and for each priority's SLA. Set both.
5. **Deploy.** From the desk's folder:
   ```bash
   pnpm exec agentflow-app deploy --parameters /abs/path/to/parameters.json --wait
   ```
   It uploads the sealed archive, asks for the install and prints `awaiting approval: <link>`. An admin opens the link, reads what the desk asks for, and presses **Approve and activate** on its setup page; `--wait` waits until it is installed. The guide explains the flow and each refusal: `<AGENTFLOW_URL>/guides/en/xay-dung-ung-dung/kiem-tra-va-trien-khai` (Vietnamese: `<AGENTFLOW_URL>/guides/xay-dung-ung-dung/kiem-tra-va-trien-khai`).
   - The install's receipt names the installation, and its **Automation** section lists the seven triggers that item 6 turns on.
   - A refusal names its cause. `APP_SETUP_INCOMPLETE` names the item left out: a parameter, or a provider, a code runner or an `https` public address the deployment lacks. `APP_PLAN_CHANGED` names the first finding the plan cannot approve. A failed activation installs nothing, because it is one transaction: fix what it names and deploy again.
   - A deployment that runs its own installer from the command line (the operator's `app-package install`) takes the same archive and parameters; the operator's document has its environment and resume rules.
6. **Arm the triggers, after step 10.** The package's seven triggers ship off, because turning them on is the organization's decision. Until they are on the desk is installed and idle: records can be made by hand, and no email becomes a ticket. Come back here once step 10 has made the autopilot rules in shadow mode, open the install's receipt under **Admin → Apps**, and press **Turn on triggers** under **Automation**. The operator can do the same from the command line (`app-package arm`).

   It starts Intake (inbound email), the three Delivery workflows (what Resend reports about each reply), Handling (a ticket's changes), Draft on customer message and Close idle tickets (daily, at the hour of `timezone`), all from one instant. After it every customer message spends model calls, and a ticket drafted before step 9 is drafted without the knowledge. Mail that reaches the inbound domain gets a ticket and a draft, and nothing is sent automatically while every rule is in shadow mode (step 10). It is all or nothing: a refusal (`APP_ARM_REFUSED`) names each trigger it holds back, for an automation principal that is missing or inactive or a Resend connection that is not the organization's.

## 9. Knowledge and lookups

Open the Support agent (**Admin → Agents**), add the help-centre articles as knowledge and any read-only MCP servers for order lookups, and publish. The package ships the agent without them, because they are your organization's own. The agent never promises a refund, a credit or an account change, whatever it reads.

## 10. Autopilot rules

Autopilot sends a reply without a person only for an intent that has a rule, and never for `refund_request` or `cancellation`. A person in **Support admins** creates the rules.

1. In **Entities → Autopilot rule**, create one record per intent you want measured: `order_status`, `invoice_request` and `product_question` to start. Set `mode` to `shadow` and turn `enabled` on. The record's other fields default to a minimum confidence of 0.9 and a line that says the reply came from an AI.
2. In shadow mode the draft is marked "autopilot would have sent this", and nothing is sent.
3. Switch an intent to `live` only after comparing `ai_body` and `body` across its sent replies. `ai_body` is the agent's untouched text, and a reply a person sent without editing it counts as unchanged.

## 11. Check it

Arm the triggers first (item 6 of step 8): until then no email becomes a ticket.

1. Send an email with a small attachment to `support@<inbound domain>` from an address outside `our_domains`. Within a minute there should be a ticket in **Entities → Ticket**, a "Handle ticket" task in the normal pool, and an AI draft in **Entities → Reply** with status `draft`. The attachment should be on the customer's Reply.
2. From the draft's record page, use the **Send** action. Check that the reply arrives, and that it threads in the customer's mail client: its subject is `Re: [TK-…] <subject>`.
3. Reply from the customer's address. The new message should land on the same ticket, and a new draft should appear.
4. From a third address, send an email with the ticket's number in the subject (`[TK-…]`). It should be filed on that ticket as an unverified sender's message, with a "held message" note saying who wrote it and how it matched, no draft, and **Accept** and **Move** actions on its record.
5. Sign in as a support person who is not an administrator, and open **Entities → Ticket**, then use **Send** on a draft. A 403 means the person is missing the Support role from step 3.

## 12. What is not verified

- Whether Resend keeps our Message-ID. Until that is checked, a customer's reply matches by its plus address or subject token, both of which every reply we send carries.
- Whether Resend's inbound API passes `Authentication-Results` through. Without it, the DMARC check never fires. Intake never treats `dmarc=pass` as trust, so nothing relies on it either way.
- Whether a customer's attachments are copied onto the Reply. No end-to-end test has sent a received file yet, so step 11 is the first check.
- A reply that bounces after a ticket was marked "Waiting on customer" leaves the ticket pending, with a system note on the thread. Close idle tickets can still close it after 7 business days.
- A delivery that Resend reports as `email.suppressed` is not recorded on the reply.

## The desk

The ticket app (steps 1 to 12 above) has no screens of its own. The desk is the app a support team works in: a React app module, which the package carries as its UI, and the small Node server its own site runs on, in this folder. **Inside AgentFlow** the package's module opens at `/apps/rfx-support-desk` and every person acts as themselves through AgentFlow's own session. That is the main path, and it needs only steps 1 and 1a, and then the checks from step 7 on. **On its own site** the desk is a separate app that signs each person in through the identity provider: that is steps 2 to 6 and 8. Its steps are numbered 1 to 10 below, with 1a beside 1, and the desk's own messages point at two of them by number (step 4, the desk config, and step 7, live updates), so keep the numbering when you edit this part.

To see the desk first, with no backend: `pnpm install && pnpm --filter support-desk dev`, then open `http://localhost:5174/?demo`. It runs the whole desk on sample data, and nothing is sent anywhere. Everything below is for a real stack. Run every command from the SDK workspace's root.

### 1. Before you start

- The ticket app is installed and armed (step 8 of the first part, through its item 6), and step 11 of the first part passes.
- You can set the API's environment and restart it (step 1a).
- For the desk's own site you also have:
  - the id of the **Support** group, and the ids of the ticket app's entities and workflows, which step 4 puts in a file; each is in the address of the page that shows its object;
  - the ability to open **Admin → Apps** in AgentFlow: you have `integration.admin`, which the `admin` role has;
  - people who each have an AgentFlow seat and have signed in to AgentFlow's own web app at least once. AgentFlow never creates an account for someone who arrives through an app, and refuses a person it has not seen with `USER_NOT_PROJECTED`;
  - Node 22.12 or later and pnpm 12, with `pnpm install` run in the SDK workspace's root.

Two gates decide what a person can do in the desk, and both come from the first part. A desk that signs in but cannot read or write is nearly always one of them.

- **The Support role** (step 3 of the first part): `entity.read`, `entity.list` and `entity.write`, and nothing else, granted to every person of both groups. Without it every ticket read answers 403 and the desk says "Your account can't do that here." The Send, Accept and Move workflows run as the person, so they fail too. **Never grant `workflow.start.any`**: it skips every workflow's start access, so a person could start Send's claim step directly with any recipient and any text.
- **The Support admins group** (`autopilot_admin_group_id`): who may change an Autopilot mode. The desk shows the switches to everyone, and AgentFlow refuses a change from anyone outside the group. Being an administrator is not enough; membership of the group is what counts. The person's first refused change turns the switches into labels for the rest of the session.

### 1a. Open the desk inside AgentFlow

The package carries the desk as its UI module, so once the ticket app is installed the desk opens in AgentFlow itself, as the person who is signed in, with no sign-in, keys, `.env` or server of its own.

1. On the **API**, set `APP_MODULES_ENABLED=true` and restart it. The worker does not read it. It is off by default, and while it is off AgentFlow answers `404 FEATURE_DISABLED` and shows "Apps don't open inside AgentFlow on this deployment."
2. Open `/apps/rfx-support-desk` in AgentFlow's web app, signed in as a member of the Support group. The package's audience is that group (the `support_group_id` that the first part's step 8 installed with), so Support admins need to be in it too, as step 3 of the first part has them. Anyone else is told the app isn't theirs.
3. Nothing else is configured. The desk reads its ids from the installation (`GET /api/v1/apps/rfx-support-desk/objects`), so there is no `desk.config.json`.

Live updates need one more setting (step 7). A person who cannot open the desk, or a desk that opens on a notice, is in step 10.

### 2. Sign-in

**Only for the desk's own site.** Inside AgentFlow the person is already signed in, and steps 2 to 6 and 8 do not apply.

Follow the [Case desk runbook](../case-desk/RUNBOOK.md), steps 1 to 3 ("AgentFlow", "The identity provider" and "AgentFlow admin"), with these names.

1. **AgentFlow** (Case desk's step 1): run it with `APP_ACCESS_ENABLED=true`, API and worker both. The flag defaults to off, and while it is off AgentFlow refuses every app's token.
2. **The identity provider** (Case desk's step 2):
   - `pnpm --filter support-desk setup-keys` writes `keys/` and `keys/registration.json`, and a `.env` with a fresh session key and the key id. Run it first. Do not run it with `--force` once `.env` holds values you set: it replaces the key and the file.
   - Add the REST resource to AgentFlow's own client, as Case desk's step 2a does, then register `keys/registration.json` as its step 2b does.
   - The client id defaults to `support-desk-dev`. The redirect URI is `http://localhost:5174/agentflow/auth/callback`, the post-logout URI `http://localhost:5174/`, and the back-channel logout URI `http://localhost:5174/agentflow/auth/backchannel-logout`.
   - For another origin or client id, set them in the command's environment, because it does not read `.env`: `SUPPORT_DESK_ORIGIN=https://desk.example.com AGENTFLOW_CLIENT_ID=support-desk-prod pnpm --filter support-desk setup-keys`. Put the same two values in `.env`.
3. **AgentFlow admin** (Case desk's step 3): in **Admin → Apps**, press **Register app** and fill in:
   - **Name:** `Support desk`;
   - **Key:** `support-desk`. Not `rfx-support-desk`: the package's installation holds that key, and this is a separate app that happens to show the same desk;
   - **Client ID:** `support-desk-dev`, which must equal the desk's `AGENTFLOW_CLIENT_ID` and cannot be changed later;
   - **Who may use it:** **Only chosen people and groups**, with the **Support** and **Support admins** groups under **Allowed**.
   - **Ceiling:** press **Ceiling** on the new row. Add the six desk entities (Ticket, Reply, Note, Contact, Canned reply, Autopilot rule) at **Write**, **People** and **Units** (the last two are read only and have no level), and the five desk workflows at **Start and work**, then **Save ceiling**. The entities and workflows exist once step 8 has installed the ticket app, so return here after it. Without a ceiling the site works only until ceilings are required, and is then refused `APP_NOT_INSTALLED`. **Setting the ceiling takes one thing away:** a registration covers no assign and owns no workflow, so **Hand over…** on a ticket's task (`POST …/work/reassign`) is refused `403 APP_CEILING_DENIED`. Claiming and releasing your own task still work. Hand a ticket over inside AgentFlow instead. The walkthrough in step 9 does not check it. Whether a ceiling should cover it is an open decision, so treat the refusal as expected.

### 3. `.env`

`setup-keys` made `.env` from `.env.example`. If you registered the keys another way, copy `.env.example` to `.env` yourself. Fill in the sign-in values as Case desk's step 5 does:

- `AGENTFLOW_ISSUER` is AgentFlow's `OIDC_ISSUER`;
- `AGENTFLOW_ORG_HINT` only when a person belongs to several organizations;
- `AGENTFLOW_API_BASE_URL` stays `http://localhost:8080/api/v1` for a local AgentFlow, and is `{HTTP_PUBLIC_BASE}/api/v1` for a deployed one;
- `AGENTFLOW_RESOURCE` stays blank;
- leave `SUPPORT_DESK_SESSION_KEY`, `AGENTFLOW_PRIVATE_KEY_FILE` and `AGENTFLOW_PRIVATE_KEY_ID` as `setup-keys` wrote them.

### 4. `desk.config.json`

**Only for the desk's own site.** The desk's server reads the ids of the ticket app's entities and workflows from a file, `desk.config.json`. Git ignores it. Inside AgentFlow the desk reads them from the installation and needs no file.

Write the file by hand, with each id taken from the address of the page that shows its object: the entities are under **Entities** and the workflows under **Workflows**. The keys of `workflows` are the package's local keys, as below (an installed workflow's own key is `rfx_support_desk__` followed by its local key):

```json
{
  "entities": { "ticket": "…", "reply": "…", "note": "…", "contact": "…", "canned_reply": "…", "autopilot_rule": "…" },
  "workflows": {
    "support_handling": "…", "support_draft_reply": "…", "support_send_reply": "…",
    "support_accept_message": "…", "support_move_message": "…"
  },
  "support_group_id": "<the Support group's id>"
}
```

Every id must be a UUID. `SUPPORT_DESK_CONFIG_FILE` in `.env` names the file (default `desk.config.json`). With step 1a's settings on, a member of the Support group who is signed in to AgentFlow can read the same ids off `/api/v1/apps/rfx-support-desk/objects`: each entry's `logical_key` is `entity:<key>` or `workflow:<local key>`, with its `id`, and `parameters` carries `support_group_id`.

The desk finds its ids by asking `GET /agentflow/api/app/objects`, the same call it makes inside AgentFlow. Inside AgentFlow that call is answered from the installation. This desk signs in as an app registered without a package, for which AgentFlow lists no objects, so this server answers it from `desk.config.json`, in AgentFlow's shape. That answer is interim: how a standalone desk should reach a packaged installation's objects is an open question, and the file goes when it is settled.

### 5. Check

`pnpm --filter support-desk check-setup` prints one line per check: `configuration`, `identity provider`, `private_key_jwt`, `AgentFlow API`, `desk config` and `live updates`. A missing or malformed value in `.env` or the desk config is listed with the others in one `configuration` line, so you fix them all and rerun until nothing shows ✗. A `!` on `live updates` means `.env` still holds the relay's two variables from before the desk read AgentFlow's event stream: step 7 says what to remove.

### 6. Run

`pnpm --filter support-desk dev`, then open `http://localhost:5174`. Use exactly that address, not `127.0.0.1`: the sign-in cookie belongs to the host name. Sign in as a member of the Support group. **Unclaimed in my pools** lists the "Handle ticket" tasks of the pools the person is placed in, and **Mine** the ones they claimed. `pnpm dev` serves only `http://localhost:5174`; for another origin, use step 8. The dev server speaks plain HTTP/1.1, and every signed-in desk tab holds one long-lived connection to it (step 7), so keep to a few desk tabs per browser.

The desk reads `.env` when it starts, so restart it after editing that file.

### 7. Live updates

Live updates come from AgentFlow's event stream: a customer's message, a claim or a colleague's reply shows within seconds, and each person sees who else has a ticket open. Nothing is set in the desk; AgentFlow needs two things:

1. AgentFlow's API runs with `REALTIME_CHANNEL_ENABLED=true`, and a worker is running. Without the flag the desk works, refreshes every 30 seconds, and its rail reads **Polling**.
2. A proxy in front of AgentFlow or the desk must not buffer or compress `text/event-stream`. AgentFlow's own Caddy files already leave it alone.

Open the desk and sign in: the rail's status reads **Live** within a few seconds. Each tab is one stream, and AgentFlow allows a person six. Over HTTP/2, where the browser multiplexes every request onto one connection, a seventh tab therefore polls. Over HTTP/1.1 the browser's six connections per host are shared by every tab, and each stream holds one for as long as the tab is open, so a few desk tabs can stall each other's saves, reads and heartbeats before AgentFlow's limit applies: serve the desk over HTTP/2 in production (step 8) and keep to a few tabs in development (step 6).

**A desk that used the webhook relay:**
- Remove `SUPPORT_DESK_RELAY_API_KEY` and `SUPPORT_DESK_WEBHOOK_SECRET` from `.env`; `check-setup` warns while they are there.
- Delete the relay's subscription in **Admin → Webhooks**, since it would keep posting to an address that now answers 404.
- Deactivate the **Support desk relay** service principal and revoke its key (step 5 of the first part).

To watch the stream itself, open the desk, sign in, and run this in the browser's console. It prints what arrives: a keep-alive comment every 20 seconds, and an event within a couple of seconds of any change to a ticket.

```js
const r = await fetch('/agentflow/api/events/stream?presence=true', { headers: { accept: 'text/event-stream' } });
const reader = r.body.getReader(); const text = new TextDecoder();
for (;;) { const { value, done } = await reader.read(); if (done) break; console.log(text.decode(value)); }
```

It answers `404` when AgentFlow runs without the flag.

### 8. Production

`pnpm --filter support-desk build`, then `pnpm --filter support-desk start` behind https, on **one instance**: sessions live in that process's memory, so a restart signs everyone out. Register the production origin's three URIs on the client. A proxy in front must pass `text/event-stream` through unbuffered and uncompressed (step 7), and must speak HTTP/2 to the browser: each tab holds a stream open, and over HTTP/1.1 a few tabs use up the browser's six connections per host and stall each other. Caddy serves HTTP/2 by default over https; nginx needs HTTP/2 switched on (`http2` on the `listen` line, or `http2 on;`). The desk's own Node server speaks plain HTTP/1.1, so browsers must not reach it directly. `start` reads the same `.env` and the `PORT` it names (default 5174).

### 9. The walkthrough

This is the real-stack check that the Playwright run cannot make: signing in, the real API and its permissions, the workflows, the event stream and the email itself. Use two support people, A and B, in two browsers, and tick each item as it passes. Inside AgentFlow there is no desk server and no **Sign out**, so skip item 9 and, in item 10, the sentence about stopping the desk server.

1. Send an email with a small attachment to the inbound address, from an address outside `our_domains`. Within a minute the ticket shows in both queues as unclaimed, with an **AI draft** chip once Draft reply finishes. Open the ticket, and open the attachment listed under the customer's message: it downloads. If it answers 404, it is the known event-file gate (step 12 of the first part: customer attachments are not yet confirmed to reach the Reply). Note it as a follow-up; it is not a desk bug.
2. A presses ⇧N: the ticket opens claimed by A. B's row for it shows A's viewing ring.
3. B opens the same ticket: each one's header shows the other's viewing ring. B edits the reply, and A, who has typed nothing, sees B's text within seconds. When both have typed, the later save is refused and offers **Keep mine** or **Use theirs**.
4. A presses **Shorter**, waits for the new text, then **Undo redraft**.
5. Reply to the ticket's email from the customer's mailbox while A's draft is open. The new message appears in both browsers within seconds. A presses **Send**: "Send paused." A presses **Send anyway**, then **Undo** inside ten seconds: nothing arrives in the customer's mailbox.
6. A presses ⌘⇧↵ and, while the countdown runs, goes to another ticket (J, then ↵). A bar above the screen keeps the countdown, with **Undo** and **Open**. At ten seconds the customer receives the reply, threaded under their message, with no need for A to go back. The ticket leaves A's **Mine** and shows in **Waiting on customer**, the bar says "<name> · Sent. Ticket marked Waiting on customer." for about eight seconds and then goes by itself (a send that failed, or is not known to have gone, stays until A closes it, and apart from countdowns, which always show, the bar shows at most the newest three), and the thread shows "A: Marked waiting on customer".
7. B adds a note mentioning A (typing `@` and choosing A): A's **Mentions** count goes up.
8. Send an email to the ticket's reply address from a third address. It shows in **Held messages** with "Not on the ticket". **Accept** moves it into the conversation.
9. Open the desk in a second tab as A and press **Sign out** at the foot of the rail (that clears only what A left unsent in that second tab, so the first tab keeps its text). Back in A's first tab, type in the composer: the banner "You were signed out. Sign in again; your unsent reply is kept." appears. Press **Sign in again**: the page reloads to the desk's sign-in page. Sign in: the text is still there, and saves.
10. Take A's network down for a minute while A types (the browser's offline mode will do), then bring it back: the rail shows **Polling**, then **Live**, and A's text is saved. Stopping the desk server instead also signs everyone out (sessions live in its memory), so A signs in again as in item 9 and finds the text.

### 10. Troubleshooting

On the desk's own site, sign-in refusals come back to the desk's sign-in page with the code at the end of the address (`/?agentflow_error=…`). The page says in words what to ask an administrator for, for `APP_NOT_ASSIGNED`, `APP_NOT_INSTALLED` and `INVALID_TOKEN`, and only that sign-in did not complete for any other code. It never shows the code, so read the address. The Network panel shows the same code as the `type` of a failed API response. Inside AgentFlow the first rows of the table apply.

| Symptom | Cause |
|---|---|
| `/apps/rfx-support-desk` shows "Apps don't open inside AgentFlow on this deployment." | The API runs without `APP_MODULES_ENABLED=true` (step 1a). |
| It shows "There is no app at this address in your organisation." | No installation has the key `rfx-support-desk` in this organization: the install of the first part's step 8 was made in another organization, or has not run. |
| It shows "Support desk is turned off in your organisation." | The installation's **Enabled** switch is off under **Admin → Apps**. |
| It shows "Support desk isn't available to you." | The person is not in the Support group, the package's audience (step 1a). |
| It shows "Support desk couldn't be loaded", or "failed to start". | The module's file could not be fetched, or it threw as it started. Try again, then reload: a page left open across an upgrade asks for a release that is no longer the active one. If it keeps failing, one of two things is persistent: the API cannot load the release from its `STORAGE_DIR` (the install ran with a storage directory the API does not share), or the bundle does not export `mount` (`load_failed`). |
| No email becomes a ticket, and nothing drafts. | The triggers are still off: arming (item 6 of step 8 of the first part) has not run, or was refused (`APP_ARM_REFUSED`). |
| The address ends `?agentflow_error=INVALID_TOKEN`. | AgentFlow answered 401 `INVALID_TOKEN`. Either `APP_ACCESS_ENABLED` is off (step 2.1), which refuses every app's token, or `AGENTFLOW_RESOURCE` differs from AgentFlow's `API_RESOURCE_URI`, so the token's audience is not one AgentFlow accepts. |
| `?agentflow_error=APP_NOT_INSTALLED`; or the desk opens on its sign-in page for someone who was signed in, and signing in again ends at that address; or, in a tab that was already open, every read fails with "Your account can't do that here." and the Network panel shows 403 `APP_NOT_INSTALLED`. | The client id under **Admin → Apps** differs from `AGENTFLOW_CLIENT_ID`, the app is registered in another organization, or its **Enabled** switch is off (step 2.3). |
| `?agentflow_error=APP_NOT_ASSIGNED`, or the desk opens on its sign-in page for someone who was signed in, and signing in again ends at that address. | The person is in neither group under **Allowed** in the Support desk's audience (step 2.3). Add them or their group. |
| `?agentflow_error=USER_NOT_PROJECTED`. | The person has never signed in to AgentFlow's own web app in that organization (step 1). |
| The provider shows an error about the client or the redirect URI, or sign-in stops at `/agentflow/auth/callback?error=…`. | The desk is not registered, or its origin or client id differs from the registration (step 2.2). The [Case desk runbook's](../case-desk/RUNBOOK.md) troubleshooting table (step 7) explains each provider error code. |
| **Status stays Polling.** | AgentFlow's stream is off or not reachable. In the Network panel, `/agentflow/api/events/stream` answering `404` means AgentFlow runs without `REALTIME_CHANNEL_ENABLED=true`; `503` that its API has just started or holds as many streams as it allows; `429` that this person has six desk tabs open. A stream that opens but never shows a frame is held back by a proxy in front (step 7). |
| Every tab hangs on **Saving…** or loading with several desk tabs open. | The connection between the browser and the desk is HTTP/1.1 (the dev server, or a proxy without HTTP/2), and its six connections per host are all taken by the tabs' event streams. Close tabs, or serve the desk over HTTP/2 (step 8). |
| **Hand over…** fails once the desk has a ceiling, and the Network panel shows 403 `APP_CEILING_DENIED` on `…/work/reassign`. | Expected: a registration's ceiling covers no assign (step 2.3). Hand the ticket over inside AgentFlow. |
| "This desk is not set up yet." | The desk's own site only: `/support-desk/config.json` failed, because the server could not read `desk.config.json`. Run `check-setup`. |
| "Couldn't reach AgentFlow. Reload to try again." | The desk's server says this browser is signed in, but its own read of who that is (`GET /agentflow/api/caller`) failed with neither a `401` nor a `403`: AgentFlow is down or the desk's server cannot reach it, the desk's server cannot reach the identity provider (the proxy answers `503 IDP_UNAVAILABLE`), or the call failed in the network. A `401` or `403` is a refusal (the session ended, or the app was turned off for the person) and shows the sign-in page instead, whose next sign-in says which. Signing in again would not mend an outage, so this page offers a reload. |
| "The ticket app isn't fully set up", with a list such as `entity:canned_reply` or `parameters.support_group_id`. | The answer to `GET /agentflow/api/app/objects` lacks those objects. On the desk's own site this server answers it from `desk.config.json`, which `check-setup` accepts only with every id in it, so here it means a proxy in front sent that path on to AgentFlow, which lists no objects for a registration without a package. Inside AgentFlow it means the installation lacks those objects: it is not the desk's package, or an object of it is no longer live. |
| A queue is empty for a person who should see tickets. | They are not placed in a priority pool (step 4 of the first part, the unit pools), or not in the Support group. |
| Every ticket read, Send, Accept or Move fails with "Your account can't do that here." for one person. | The person is missing the Support role (step 1 of this part, and step 3 of the first part). |
| Someone cannot change an Autopilot mode: "Your account can't change autopilot rules, so the modes are shown as labels." | The person is not in the Support admins group (`autopilot_admin_group_id`). |
| A priority change does not move the ticket's open task. | It applies once the task is marked: the next task opens in the new priority's pool. The ticket's header says so. |
