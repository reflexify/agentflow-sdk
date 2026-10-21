// The support desk's own names and workflow pieces. The generic helpers come from the app builder;
// the sections turn what they build into ../../package: edit them, run `pnpm build:package`, commit the
// package it rewrites.
import { bind, decision, edges, otherwise, ref, restricted, servicePrincipal, setvar, tpl, update, upsert, when } from "@reflexify/agentflow-app-builder/workflow";

export * from "@reflexify/agentflow-app-builder/workflow";

export const SP = servicePrincipal("automation_principal_id");
export const SUPPORT = restricted("support_group_id");
export const CONNECTION = { provider: "resend", externalAccountId: "${param:resend_connection_id}" };

export const TICKET = "${entity:ticket}";
export const REPLY = "${entity:reply}";
export const NOTE = "${entity:note}";
export const CONTACT = "${entity:contact}";
export const RULE = "${entity:autopilot_rule}";

// Finds the contact with an email address, or makes one, and leaves its id in
// `vars.contact_id`. Intake and Move both need it. `entry` is the step to wire
// into (`contact_upsert`), and both outcomes carry on to the step `next`.
//
// One Upsert on the email key, not a search and then a create: two first emails
// from one new sender run at the same time, each would find no contact, and the
// second create would fail on the address being taken. The Upsert claims the
// key in one statement, so the second waits for the first and finds its
// contact. The name goes in only when the Upsert made the contact: a contact a
// person has named is never renamed by an email's From header.
export function contactUpsert({ email, name, next }) {
  return {
    entry: "contact_upsert",
    nodes: [
      upsert("contact_upsert", "Find or make the contact", CONTACT, "email", [bind("email", email)]),
      decision("contact_made", "New contact?", [
        when("e_made", { "==": [{ var: "nodes.contact_upsert.output.created" }, true] }),
        otherwise("e_found"),
      ]),
      update("contact_name", "Name the new contact", CONTACT, "nodes.contact_upsert.output.record.id", [bind("name", name)]),
      setvar("set_contact", "Use the contact", [["contact_id", ref("nodes.contact_upsert.output.record.id")]]),
    ],
    edges: edges(
      ["e_cu", "contact_upsert", "contact_made"],
      ["e_made", "contact_made", "contact_name"],
      ["e_found", "contact_made", "set_contact"],
      ["e_cn", "contact_name", "set_contact"],
      ["e_sc", "set_contact", next],
    ),
  };
}

// The three mail headers a claim workflow takes that come from a ticket and a
// draft: the subject the desk matches a customer's answer by (`Re: [number]
// subject`), the plus address replies come back to, and the draft's Cc. Send
// and Draft both call a claim workflow with them. `ticket` and `draft` are the
// context paths of the two records, such as `subject.record`. The reply-to
// reads `vars.inbound_domain`, so the calling workflow must run
// `readParameters("inbound_domain")` before the claim; without it the Reply-To
// renders `support+N@` and nothing complains.
export const claimMailHeaderBindings = ({ ticket, draft }) => [
  ["cc", tpl(`{{ ${draft}.cc or '' }}`)],
  ["subject", tpl(`Re: [{{ ${ticket}.number }}] {{ ${ticket}.subject }}`)],
  ["reply_to", tpl(`support+{{ ${ticket}.number }}@{{ vars.inbound_domain }}`)],
];
