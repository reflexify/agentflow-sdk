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

The records are read-only: only the source writes them. A record the ERP deletes stays, with `deleted_in_erp` set,
so a reference to it still opens; a line the ERP drops is moved to the trash. Currency, unit and item-unit values on a
document are codes (`VND`, `kg`) kept as text: find the currency or unit by its `code`.

**There is no first full load yet.** An installed package holds only what changes in the ERP after the install,
until the platform's first-load work lands.

## Who may read the records

The package asks for two answers at install: the `erp` connection (an ERP connection of the organization) and the
`erp_readers` group. Its members may read and list every record, and nobody may create, update or delete one.
Give them a role with `entity.read` and `entity.list`: a role does not come from a group.

A dependent app does not widen that. A person who works a dependent app and opens an ERP record from it, a purchase
order from the AP app for instance, must be an ERP reader too.

## Depending on it

A dependent lists the package and the entities it reads in `config/package-manifest.json`:

```json
"requires": {
  "platformCapabilities": [],
  "entities": [],
  "packages": [
    { "id": "rfx/erp-core", "range": "^1.0.0",
      "access": { "entity:purchase_order_line": { "access": "read", "fields": [] } } }
  ]
}
```

and points a reference field at an entity with the `dep` form, which the builder writes as an `@dep:` sentinel:

```json
{ "key": "po_line", "label": "Purchase order line", "type": "reference",
  "target_entity_id": "${dep:rfx/erp-core#entity:purchase_order_line}" }
```

`erp-core` is installed in the organization before the dependent, or together with it.

## Adding your own fields

Records here are written by the sync alone, so a plain field added to an entity would stay empty. To adapt the data to a business:

- **A standard ERP field nobody maps yet:** ask for it in `erp-core`, a minor release every app then gets.
- **Data that is not in the ERP:** keep it in your app's own entity, with a reference to the `erp-core` record.
- **An organization's custom ERP fields** (Odoo `x_…`, NetSuite `custbody…`): planned. Once an organization maps its custom fields on the connection, a dependent package or an admin will be able to add fields to these entities, filled from `custom.*`. Until then, give your app its own entity with a source on the same stream and a reference to the `erp-core` record by key.

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
