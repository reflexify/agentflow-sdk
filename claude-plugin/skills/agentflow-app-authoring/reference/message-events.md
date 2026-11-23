<!-- Generated from the backend messaging contract. Do not edit: the message_reference test of agentflow-integrations rewrites it, and its failure message says how. -->

# Message events

A `connected_app` trigger on a messaging connection starts a run on a `message.*` event. Every field sits under `properties` and is addressed as `properties.<name>`. "Sensitive by default" marks personal data or message content: a run reads it in full, as it reads every field, so copy it only where the people who read it may see it. Empty means absent or null.

`channel` is one of `chat`, `sms`, `whatsapp`, `slack`, `teams`, `voice`, `webhook`.

## Identities

`from` and `to` are each an identity, `{kind, value, display, verified}`. `kind` is one of `email`, `phone`, `handle`, `visitor`; a `phone` value is E.164, and a `visitor` value is the chat thread's id. `to` is one identity, not a list as on email. `from_value`, `from_kind` and `to_value` repeat the identities' `value` and `kind` as plain text: filter a sender on those. `display` is the name the channel shows, or null. `verified` is null for a sender nobody proved, else an object whose `method` is one of `site`, `email_code`, `agentflow`, `channel`, with what that method proved:

| method | `verified` |
|---|---|
| `site` | `{method, sub, email, name}` |
| `email_code` | `{method, email}` |
| `agentflow` | `{method, sub, email, user_id?}`: never a name, which the account holder chose |
| `channel` | `{method, phone}`, `{method, email}` or `{method, user_id, email?}` |

## `message.received`

Message received

| field | type | sensitive by default | empty when |
|---|---|---|---|
| `provider` | text | no | never |
| `channel` | text | no | never |
| `provider_message_id` | text | no | the provider names no id for the message |
| `thread_id` | text | no | the message belongs to no channel thread |
| `from` | object | yes | the provider reports no sender |
| `to` | object | yes | the provider reports no recipient |
| `from_value` | text | yes | the provider reports no sender |
| `from_kind` | text | no | the provider reports no sender |
| `to_value` | text | yes | the provider reports no recipient |
| `sent_at` | datetime | no | the provider reports no time for the message |
| `text` | text | yes | the message carries no text |
| `attachments` | attachment_list | yes | an empty list when no attachment was stored |
| `reply_window_ends_at` | datetime | no | the channel imposes no reply window |
| `channel_data` | object | yes | an empty object when the channel adds nothing |

## `message.sent`

Message sent

| field | type | sensitive by default | empty when |
|---|---|---|---|
| `provider` | text | no | never |
| `channel` | text | no | never |
| `provider_message_id` | text | no | the provider names no id for the message |
| `thread_id` | text | no | the message belongs to no channel thread |
| `from` | object | yes | the provider reports no sender |
| `to` | object | yes | the provider reports no recipient |
| `from_value` | text | yes | the provider reports no sender |
| `from_kind` | text | no | the provider reports no sender |
| `to_value` | text | yes | the provider reports no recipient |
| `sent_at` | datetime | no | the provider reports no time for the message |
| `sent_by_workflow_id` | workflow_ref | no | the message was not sent by a workflow step |
| `sent_by_instance_id` | text | no | the message was not sent by a workflow step |
| `sent_by_node_id` | text | no | the message was not sent by a workflow step |
| `outbound_id` | text | no | never |

## `message.delivered`

Message delivered

| field | type | sensitive by default | empty when |
|---|---|---|---|
| `provider` | text | no | never |
| `channel` | text | no | never |
| `provider_message_id` | text | no | the provider names no id for the message |
| `thread_id` | text | no | the message belongs to no channel thread |
| `from` | object | yes | the provider reports no sender |
| `to` | object | yes | the provider reports no recipient |
| `from_value` | text | yes | the provider reports no sender |
| `from_kind` | text | no | the provider reports no sender |
| `to_value` | text | yes | the provider reports no recipient |
| `sent_at` | datetime | no | the provider reports no time for the message |
| `sent_by_workflow_id` | workflow_ref | no | the message was not sent by a workflow step |
| `sent_by_instance_id` | text | no | the message was not sent by a workflow step |
| `sent_by_node_id` | text | no | the message was not sent by a workflow step |
| `outbound_id` | text | no | the message was not sent through a connection by this platform |
| `reason` | text | no | the provider gives no detail |

## `message.read`

Message read

| field | type | sensitive by default | empty when |
|---|---|---|---|
| `provider` | text | no | never |
| `channel` | text | no | never |
| `provider_message_id` | text | no | the provider names no id for the message |
| `thread_id` | text | no | the message belongs to no channel thread |
| `from` | object | yes | the provider reports no sender |
| `to` | object | yes | the provider reports no recipient |
| `from_value` | text | yes | the provider reports no sender |
| `from_kind` | text | no | the provider reports no sender |
| `to_value` | text | yes | the provider reports no recipient |
| `sent_at` | datetime | no | the provider reports no time for the message |
| `sent_by_workflow_id` | workflow_ref | no | the message was not sent by a workflow step |
| `sent_by_instance_id` | text | no | the message was not sent by a workflow step |
| `sent_by_node_id` | text | no | the message was not sent by a workflow step |
| `outbound_id` | text | no | the message was not sent through a connection by this platform |
| `reason` | text | no | the provider gives no detail |

## `message.failed`

Message failed

| field | type | sensitive by default | empty when |
|---|---|---|---|
| `provider` | text | no | never |
| `channel` | text | no | never |
| `provider_message_id` | text | no | the provider names no id for the message |
| `thread_id` | text | no | the message belongs to no channel thread |
| `from` | object | yes | the provider reports no sender |
| `to` | object | yes | the provider reports no recipient |
| `from_value` | text | yes | the provider reports no sender |
| `from_kind` | text | no | the provider reports no sender |
| `to_value` | text | yes | the provider reports no recipient |
| `sent_at` | datetime | no | the provider reports no time for the message |
| `sent_by_workflow_id` | workflow_ref | no | the message was not sent by a workflow step |
| `sent_by_instance_id` | text | no | the message was not sent by a workflow step |
| `sent_by_node_id` | text | no | the message was not sent by a workflow step |
| `outbound_id` | text | no | the message was not sent through a connection by this platform |
| `reason` | text | no | the provider gives no explanation |

## Which provider sends which event

| provider | `message.received` | `message.sent` | `message.delivered` | `message.read` | `message.failed` |
|---|---|---|---|---|---|
| `webhook` | ✓ | ✓ |  |  | ✓ |
| `loopback_messaging` | ✓ | ✓ |  |  |  |
| `chat` | ✓ | ✓ |  |  |  |
