# Notification settings

An app that declares `notifications` in its manifest (`notifications.md` in the authoring skill) can show a
settings screen with the person's own switches for its kinds. The person's switch for a kind is one in-app and one per
external channel, such as email. AgentFlow's notification preferences page shows the same switches, so a change in either
place is seen in the other.

- `GET /app/notification-preferences` answers `{ kinds: [{ key, label, channels: [{ channel_type, enabled, default,
  updated_at }] }], content_locale }` for the app's own kinds only. `label` is a string or a map from language tag to
  string: pick the person's language, then `content_locale`. `channel_type` is `in_app` or `email`. `default` is the start
  value, and `updated_at` is `null` until the person has set the switch.
- `PUT /app/notification-preferences` takes `{ preferences: [{ notice_key, channel_type, enabled, updated_at? }] }` and
  answers `204`. Send back the `updated_at` you read with the switch (leave it out for one never set).
- Call both through `host.api` by path, `host.api.GET('/app/notification-preferences')` and
  `host.api.PUT('/app/notification-preferences', { body })`; the types are in `@reflexify/agentflow-sdk`
  (`AppNoticePreferences`, `AppNoticeChannelSwitch`). Name no installation and no key: inside AgentFlow the host sends
  the call to the installed app's own route, and on the app's own site the token names the installation. A
  registration without a package sees `kinds: []`.
- A kind lists `in_app` and each external channel the organization has on, so with email off for the organization no
  kind has an `email` switch. Draw the columns from the channels the answer holds, and show no email column then,
  rather than an empty cell.
- A stale `updated_at` answers `409`: someone changed the switch since you read it. Reload the switches and show the new
  state; do not resend the old one.
- Show AgentFlow's own sentence for a refusal, as step 3 says. Do not show a raw code.

```ts
import { ok, type AppHost, type components } from '@reflexify/agentflow-sdk';

type Prefs = components['schemas']['AppNoticePreferences'];
type Switch = components['schemas']['AppNoticeChannelSwitch'];

export const readSwitches = (host: Pick<AppHost, 'api'>): Promise<Prefs> =>
  ok(host.api.GET('/app/notification-preferences'));

// One switch, sent with the `updated_at` it was read with; the answer is 204, so read the switches again.
export async function setSwitch(host: Pick<AppHost, 'api'>, notice_key: string, read: Switch, enabled: boolean): Promise<Prefs> {
  await ok(host.api.PUT('/app/notification-preferences', {
    body: { preferences: [{ notice_key, channel_type: read.channel_type, enabled, ...(read.updated_at ? { updated_at: read.updated_at } : {}) }] },
  }));
  return readSwitches(host);
}

// The columns: the channels the answer holds, `in_app` always and `email` only while the organization has it on.
export const channelsOf = (prefs: Prefs): string[] =>
  [...new Set(prefs.kinds.flatMap((kind) => kind.channels.map((c) => c.channel_type)))];
```
