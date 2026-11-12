# erp-core

`rfx/erp-core` is the first-party package that keeps an organization's ERP records in AgentFlow, so other apps can
read them and point at them. It holds twelve entities, each filled from a canonical ERP stream through its
`source` and all exported:

| Entity | Stream | Lines of |
|---|---|---|
| `company`, `currency`, `unit` (stream `uom`), `tax_code`, `vendor`, `item` | the stream of the same name | |
| `purchase_order`, `goods_receipt`, `vendor_bill` | the stream of the same name | |
| `purchase_order_line` | | `purchase_order` |
| `goods_receipt_line` | | `goods_receipt` |
| `vendor_bill_line` | | `vendor_bill` |

The records are read-only: only the source writes them. A record whose deletion the connection reports stays, with
`deleted_in_erp` set, so a reference to it still opens; a line the ERP drops is moved to the trash. Odoo's streams report
no deletions (Odoo refuses to delete a confirmed order, a done receipt, a posted bill or a vendor or product in use), so
the flag is never set from Odoo. Currency, unit and item-unit values on a
document are codes (`VND`, `kg`) kept as text: find the currency or unit by its `code`.

**What an install loads.** Once erp-core is installed and its sources are armed, the scheduled poll starts each
stream's [first full load](../../../docs/design/integrations.md#the-first-full-load) in place of its first read, within
one poll interval on Odoo: 5 minutes for documents, 15 for vendors and items, an hour for the rest. Documents load
open: purchase orders in an open state and not fully invoiced, the receipts of those orders, and bills that are draft
or posted and not paid or partly paid. Master data (companies, currencies, units, tax codes, vendors, items) loads
whole. A closed or paid document arrives when it next changes. An admin can load a connection's full history with
`POST /api/v1/admin/integrations/connections/{id}/load` and the body `{"scope": "all"}`.

## What each entity holds

Every entity but the three lines entities also carries `status` (its own set, in the table), `raw_status` (the ERP's own
word for it), `company` (a reference to `company`: whose record it is), `erp_id` (the ERP's id for the record, which a
write back to the ERP names it by), `changed_in_erp` (datetime) and `deleted_in_erp` (boolean). A reference points at the
entity named after the arrow, and a `list` field holds rows with the members named.

| Entity | Fields | `status` |
|---|---|---|
| `company` | `name`, `tax_code`, `base_currency`, `country`, `parent` (→ company) | active, inactive, other |
| `currency` | `code`, `name`, `decimals` (number) | active, inactive, other |
| `unit` | `code`, `name`, `category`, `factor` (number) | active, inactive, other |
| `tax_code` | `code`, `name`, `rate` (number), `category` (standard, reduced, zero, exempt, not_subject, not_declared, other), `direction` (purchase, sale, both), `prices_include_tax` (boolean) | active, inactive, other |
| `vendor` | `code`, `name`, `tax_code`, `currency`, `email`, `phone`, `addresses` (list of kind, line1, line2, city, region, postal_code, country) | active, inactive, blocked, other |
| `item` | `code`, `name`, `kind` (stock, non_stock, service, other), `base_uom`, `purchase_uom`, `bill_control` (ordered, received) | active, inactive, other |
| `purchase_order` | `number`, `vendor` (→ vendor), `vendor_ref`, `currency`, `exchange_rate` (number), `order_date` (date), `expected_date` (date), `buyer_email`, `buyer_name`, `prices_include_tax` (boolean), `amount_untaxed` (number), `amount_tax` (number), `amount_total` (number), `receipt_state` (none, partial, full), `billing_state` (none, partial, full) | draft, pending_approval, open, closed, cancelled, other |
| `goods_receipt` | `number`, `vendor` (→ vendor), `received_on` (date), `direction` (receipt, return), `po_refs` (list of erp_id, number), `vendor_delivery_ref`, `warehouse_erp_id` | draft, pending_approval, done, cancelled, other |
| `vendor_bill` | `number`, `kind` (invoice, credit), `vendor` (→ vendor), `vendor_invoice_number`, `invoice_date` (date), `posting_date` (date), `due_date` (date), `currency`, `exchange_rate` (number), `prices_include_tax` (boolean), `fiscal_scheme`, `fiscal_template_no`, `fiscal_series`, `fiscal_number`, `fiscal_issuer_tax_code`, `amount_untaxed` (number), `amount_tax` (number), `amount_total` (number), `amount_due` (number), `po_refs` (list of erp_id, number), `external_ref`, `payment_status` (unpaid, partial, paid, unknown) | draft, pending_approval, parked, posted, cancelled, other |
| `purchase_order_line` | `purchase_order` (→ purchase_order), `erp_line_id`, `line_no` (number), `kind` (item, service, account, charge, note), `item` (→ item), `account_erp_id`, `description`, `uom`, `qty_ordered` (number), `unit_price` (number), `discount_percent` (number), `taxes` (list of tax_code_erp_id, code, rate, category, amount), `amount_untaxed` (number), `amount_total` (number), `qty_received` (number), `qty_billed_posted` (number), `qty_billed_draft` (number), `receipt_required` (boolean), `receipt_line_matching` (boolean), `closed` (boolean), `dimensions` (list of dimension_erp_id, value_erp_id) |  |
| `goods_receipt_line` | `goods_receipt` (→ goods_receipt), `erp_line_id`, `line_no` (number), `po_line` (→ purchase_order_line), `item` (→ item), `description`, `uom`, `qty` (number), `qty_accepted` (number), `qty_rejected` (number) |  |
| `vendor_bill_line` | `vendor_bill` (→ vendor_bill), `erp_line_id`, `line_no` (number), `kind` (item, service, account, charge, note), `po_line` (→ purchase_order_line), `receipt_line` (→ goods_receipt_line), `item` (→ item), `account_erp_id`, `description`, `uom`, `qty` (number), `unit_price` (number), `discount_percent` (number), `taxes` (list of tax_code_erp_id, code, rate, category, amount), `amount_untaxed` (number), `dimensions` (list of dimension_erp_id, value_erp_id) |  |

A field with no type beside it is `text`. To write a draft bill back to the ERP, see the authoring skill's
`steps.md`, "A vendor bill".

## Who may read the records

The package asks for two answers at install: the `erp` connection (an ERP connection of the organization) and the
`erp_readers` group. Its members may read and list every record, and nobody may create, update or delete one.
Give them a role with `entity.read` and `entity.list`: a role does not come from a group.

A dependent app does not widen that. A person who works a dependent app and opens an ERP record from it, a purchase
order from the AP app for instance, must be an ERP reader too. So must the service principal of a dependent's workflow
that a trigger starts, when the workflow reads an ERP record: add the principal itself to `erp_readers`, since a group
never holds another group, so the dependent's automation group in `erp_readers` does nothing.

## Depending on it

A dependent lists the package and the entities it reads in `config/package-manifest.json`:

```json
"requires": {
  "platformCapabilities": [],
  "entities": [],
  "packages": [
    { "id": "rfx/erp-core", "range": "^1.0.0",
      "access": { "entity:purchase_order_line": { "access": "read", "fields": ["qty_ordered", "qty_received"] } } }
  ]
}
```

and points a reference field at an entity with the `dep` form, which the builder writes as an `@dep:` sentinel:

```json
{ "key": "po_line", "label": "Purchase order line", "type": "reference",
  "target_entity_id": "${dep:rfx/erp-core#entity:purchase_order_line}" }
```

In the `requires` block, `fields` lists every field of the entity that the dependent's workflows and triggers read. It bounds each run of the dependent, whether the app launches it or a trigger, a schedule or an escalation starts it, and `agentflow-app lint` reports a field a step or trigger names that is missing from it (`ceiling_uncovered`).

`erp-core` is installed in the organization before the dependent, or together with it.

## Adding your own fields

Records here are written by the sync alone, so a plain field added to an entity would stay empty. To adapt the data to a business:

- **A standard ERP field nobody maps yet:** ask for it in `erp-core`, a minor release every app then gets.
- **Data that is not in the ERP:** keep it in your app's own entity, with a reference to the `erp-core` record.
- **An organization's custom ERP fields** (Odoo `x_…`): an admin maps each one to a key on the connection, and a dependent package adds the field to `erp-core`'s own entity with an extension, `config/entity_extensions/<key>.json`, which copies it from `custom.<key>`. The extension extends `${dep:rfx/erp-core#entity:vendor}` (or any entity `erp-core` fills, a lines entity included), and the field is installed under the extender's prefix, `<prefix>__<field>`, so `erp-core` itself never changes. The package needs `rfx/erp-core` in `requires.packages` with an `access` entry for the entity, and setup refuses a connection that does not map the key. An organization's own extension is a package too: there is no designer path. Give your app its own entity with a source on the same stream only when you need a record of your own, not a field of `erp-core`'s.

## Versions

Within 1.x a minor release adds an entity, a field or an enum value, and nothing is renamed, removed or changed in
type or meaning, so a dependent on `^1.0.0` keeps working. A source's stream and a lines entity's key never change
inside 1.x. Anything else is 2.0.

## Publishing

An operator, not code, publishes it:

1. `pnpm build` writes `package/` from `config/`, and `pnpm check` fails when the committed `package/` has drifted.
2. `agentflow-app build`, then `agentflow-app seal` with the publisher's key, writes `rfx-erp-core-<version>.afpkg`.
3. Submit the sealed file to the deployment's app catalog under the `rfx` prefix. A customer organization installs it
   from the catalog.
