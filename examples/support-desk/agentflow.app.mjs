import { defineApp, merge } from "@reflexify/agentflow-app-builder";
import * as delivery from "./config/build/delivery.mjs";
import * as intake from "./config/build/intake.mjs";
import * as handling from "./config/build/handling.mjs";
import * as send from "./config/build/send.mjs";
import * as draft from "./config/build/draft.mjs";
import * as held from "./config/build/held.mjs";
import * as closeIdle from "./config/build/close-idle.mjs";

// Publish order: a workflow comes after every workflow it calls.
const ORDER = [
  "record_delivery", "delivery_delivered", "delivery_bounced", "delivery_failed",
  "send_claim_person", "send_claim_autopilot", "send_reply", "draft_reply", "draft_on_message",
  "accept_message", "move_apply", "move_message", "intake", "handling", "close_idle",
];

export default defineApp({
  sections: merge([delivery, intake, handling, send, draft, held, closeIdle], ORDER),
  entityOrder: ["contact", "ticket", "reply", "note", "canned_reply", "autopilot_rule"],
  exposedSteps: { support_handling: ["handle_urgent", "handle_high", "handle_normal", "handle_low"] },
});
