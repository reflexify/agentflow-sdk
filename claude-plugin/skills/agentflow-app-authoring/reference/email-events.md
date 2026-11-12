<!-- Generated from the backend email contract. Do not edit: the email_reference test of agentflow-integrations rewrites it, and its failure message says how. -->

# Email events

A `connected_app` trigger on an email connection starts a run on an `email.*` event. Every field sits under `properties` and is addressed as `properties.<name>`. "Sensitive by default" fields are redacted unless the app opts in. Empty means absent or null.

## `email.received`

Email received

| field | type | sensitive by default | empty when |
|---|---|---|---|
| `provider_message_id` | text | no | the provider names no id for the message |
| `message_id` | text | no | the Message-ID is unknown |
| `from_address` | address | yes | the provider reports no sender |
| `from` | text | yes | the provider reports no sender |
| `to` | address_list | yes | an empty list when the provider names no recipient |
| `subject` | text | yes | the provider reports no subject |
| `provider` | text | no | never |
| `cc` | address_list | yes | an empty list when the message has no Cc |
| `reply_to` | address_list | yes | an empty list when the message names no Reply-To |
| `text` | text | yes | the message has no such part, or could not be read |
| `html` | text | yes | the message has no such part, or could not be read |
| `headers` | object | yes | an empty object when the message could not be read |
| `attachments` | attachment_list | yes | an empty list when no attachment was stored |
| `attachments_not_stored` | object | yes | every attachment was stored |
| `attachments_unreadable` | boolean | no | never; false unless the attachment list could not be read |
| `in_reply_to` | text | no | the message is not a reply |
| `references` | text_list | no | an empty list when the message carries no References header |
| `plus_tags` | plus_tag_list | yes | an empty list when no recipient address carries a tag |

## `email.sent`

Email sent

| field | type | sensitive by default | empty when |
|---|---|---|---|
| `provider_message_id` | text | no | the provider names no id for the message |
| `message_id` | text | no | neither we nor the provider has a Message-ID for it (ours when the provider keeps it, else the one the provider reported) |
| `from_address` | address | yes | the provider reports no sender |
| `from` | text | yes | the provider reports no sender |
| `to` | address_list | yes | an empty list when the provider names no recipient |
| `subject` | text | yes | the provider reports no subject |
| `provider` | text | no | never |
| `sent_by_workflow_id` | workflow_ref | no | the message was not sent by a workflow step |
| `sent_by_instance_id` | text | no | the message was not sent by a workflow step |
| `sent_by_node_id` | text | no | the message was not sent by a workflow step |
| `outbound_id` | text | no | never |
| `cc` | address_list | yes | an empty list when the message had no Cc |
| `message_id_source` | text | no | no Message-ID is known for the message |

## `email.bounced`

Email bounced

| field | type | sensitive by default | empty when |
|---|---|---|---|
| `provider_message_id` | text | no | the provider names no id for the message |
| `message_id` | text | no | the Message-ID is unknown |
| `from_address` | address | yes | the provider reports no sender |
| `from` | text | yes | the provider reports no sender |
| `to` | address_list | yes | an empty list when the provider names no recipient |
| `subject` | text | yes | the provider reports no subject |
| `provider` | text | no | never |
| `sent_by_workflow_id` | workflow_ref | no | the message was not sent by a workflow step |
| `sent_by_instance_id` | text | no | the message was not sent by a workflow step |
| `sent_by_node_id` | text | no | the message was not sent by a workflow step |
| `outbound_id` | text | no | the message was not sent through a connection by this platform |
| `reason` | text | no | the provider gives no explanation |
| `permanent` | boolean | no | the provider does not say whether retrying can help |

## `email.complained`

Spam complaint

| field | type | sensitive by default | empty when |
|---|---|---|---|
| `provider_message_id` | text | no | the provider names no id for the message |
| `message_id` | text | no | the Message-ID is unknown |
| `from_address` | address | yes | the provider reports no sender |
| `from` | text | yes | the provider reports no sender |
| `to` | address_list | yes | an empty list when the provider names no recipient |
| `subject` | text | yes | the provider reports no subject |
| `provider` | text | no | never |
| `sent_by_workflow_id` | workflow_ref | no | the message was not sent by a workflow step |
| `sent_by_instance_id` | text | no | the message was not sent by a workflow step |
| `sent_by_node_id` | text | no | the message was not sent by a workflow step |
| `outbound_id` | text | no | the message was not sent through a connection by this platform |
| `reason` | text | no | the provider gives no explanation |

## `email.suppressed`

Email suppressed

| field | type | sensitive by default | empty when |
|---|---|---|---|
| `provider_message_id` | text | no | the provider names no id for the message |
| `message_id` | text | no | the Message-ID is unknown |
| `from_address` | address | yes | the provider reports no sender |
| `from` | text | yes | the provider reports no sender |
| `to` | address_list | yes | an empty list when the provider names no recipient |
| `subject` | text | yes | the provider reports no subject |
| `provider` | text | no | never |
| `sent_by_workflow_id` | workflow_ref | no | the message was not sent by a workflow step |
| `sent_by_instance_id` | text | no | the message was not sent by a workflow step |
| `sent_by_node_id` | text | no | the message was not sent by a workflow step |
| `outbound_id` | text | no | the message was not sent through a connection by this platform |
| `reason` | text | no | the provider gives no explanation |
| `permanent` | boolean | no | the provider does not say whether retrying can help |

## `email.failed`

Email failed

| field | type | sensitive by default | empty when |
|---|---|---|---|
| `provider_message_id` | text | no | the provider names no id for the message |
| `message_id` | text | no | the Message-ID is unknown |
| `from_address` | address | yes | the provider reports no sender |
| `from` | text | yes | the provider reports no sender |
| `to` | address_list | yes | an empty list when the provider names no recipient |
| `subject` | text | yes | the provider reports no subject |
| `provider` | text | no | never |
| `sent_by_workflow_id` | workflow_ref | no | the message was not sent by a workflow step |
| `sent_by_instance_id` | text | no | the message was not sent by a workflow step |
| `sent_by_node_id` | text | no | the message was not sent by a workflow step |
| `outbound_id` | text | no | the message was not sent through a connection by this platform |
| `reason` | text | no | the provider gives no explanation |

## `email.delivered`

Email delivered

| field | type | sensitive by default | empty when |
|---|---|---|---|
| `provider_message_id` | text | no | the provider names no id for the message |
| `message_id` | text | no | the Message-ID is unknown |
| `from_address` | address | yes | the provider reports no sender |
| `from` | text | yes | the provider reports no sender |
| `to` | address_list | yes | an empty list when the provider names no recipient |
| `subject` | text | yes | the provider reports no subject |
| `provider` | text | no | never |
| `sent_by_workflow_id` | workflow_ref | no | the message was not sent by a workflow step |
| `sent_by_instance_id` | text | no | the message was not sent by a workflow step |
| `sent_by_node_id` | text | no | the message was not sent by a workflow step |
| `outbound_id` | text | no | the message was not sent through a connection by this platform |
| `reason` | text | no | always: a delivery carries no reason |

## Which provider sends which event

| provider | `email.received` | `email.sent` | `email.bounced` | `email.complained` | `email.suppressed` | `email.failed` | `email.delivered` |
|---|---|---|---|---|---|---|---|
| `resend` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `loopback` | ✓ | ✓ |  |  |  |  |  |
