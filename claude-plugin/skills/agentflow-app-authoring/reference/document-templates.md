# Document templates

A document template is the layout a `document` step renders to a PDF, a Word file or both. `steps.md`, "A document
step and its template", has the file's members and the step that renders it. This file is the layout: every block,
the inline content inside a block, tables and the row that repeats per list item, page setup, the running header
and footer, expressions, show-when conditions and display masks. A template drawn in AgentFlow's designer has this
same shape, so a converted draft's template reads the same way.

## What checks a template

The platform's schema of the layout ships with the builder:
`node_modules/@reflexify/agentflow-app-builder/schemas/block-tree.schema.json`. It describes every block, inline item
and member, with the values each takes, and is the reference when this file does not say enough.

- **The build** validates `template` against that schema: a member no block has (a misspelt `loop_sourse`), a value
  outside a member's set, a wrong type, a missing required member, a heading `level` past 3, a column group of fewer
  than 2 or more than 4 columns, a repeated row without `loop_as`. A `null` on a member that is not required reads as
  absent, as AgentFlow reads it. The build also refuses a block `id` that is not a UUID, any `image` block, a
  `field_ref` or `rich_text` `path` that is not a property of `schema_json` (outside a repeated row), and the designer
  export's `{ "mode", "kind", "block_tree" }` envelope. Like everywhere in `config/`, a string that holds `${` is
  refused unless it is a whole reference, and a string that starts with `@` is refused, which includes a `text` run's
  `value`.
- **The install** checks what the schema cannot state, and refuses the package with the block's place, such as
  `document_template.blocks.<id>.rows`: a data table's `array_path` and columns against `schema_json`, a repeated
  row's source and the paths in its cells, the shape of a repeated row and of a header grid, lengths and their units,
  where a section break or a signing field may sit, and every expression, which must parse. `lint` does not read
  templates, so the first place these run is `deploy --sandbox`.
- **At render**, an expression that fails prints nothing and a condition that fails hides its block. A document that
  fails to render does not fail the step: the step goes on, and `nodes.<id>.output.documents` holds
  `{ "documentId", "status": "failed", "error" }` for it (`"skipped"` when it made no file). Only a document a
  signing step needs fails the step when its PDF is missing.

## The data a template reads

`schema_json` declares the fields the layout reads, and the step's `fieldMapping` fills them: each key is a JSON
pointer into `schema_json`, each value a binding. A field the mapping leaves out is there and empty, so it prints
nothing. A path in the layout is dotted through `properties` (`customer.name`).

A list is an `array` property whose `items` is an object schema. Bind the whole list in one entry:

```js
fieldMapping: {
  "/number": ref("subject.record.number"),
  "/lines": ref("subject.record.lines"),
}
```

A `list` field reads as an array of objects keyed by its columns, so it fits a table as it is. So does a search's
`nodes.<id>.output.records` (`steps.md`). Declare each column the layout prints in the `items` schema: the install
refuses a `field_ref` path the schema does not hold.

- A `ref` binding of a choice field prints the option's label, not its stored value. A `tpl` or `lit` binding is
  printed as written.
- Bind the value you want printed. To print a referenced record's name, bind `ref("subject.record.customer.name")`,
  not the reference.
- The Document step renders values in full. `sensitive_field_paths` does not blank them in the file; who may read the
  file is decided where it is kept.

## The tree

```json
{ "version": 1, "settings": { … }, "header": { "blocks": [ … ] }, "footer": { "blocks": [ … ] }, "blocks": [ … ] }
```

`version` is 1. `settings`, `header` and `footer` are optional. Every block has:

- `id`, a UUID of your choosing, unique in the template;
- `type`, one of `text`, `heading`, `blockquote`, `column_group`, `table`, `static_table`, `rich_text`,
  `page_break` and `spacer` (`image` exists, but a package cannot carry one);
- optional `margins`, `{ "top", "bottom", "left", "right" }` as lengths: space around the block. A negative top or
  bottom is stored as `0mm`, because Word cannot draw it; a negative left or right is kept;
- optional `condition`, an expression: the block shows only when it is true ("Expressions and conditions", below).

Lengths are a number and a unit, `mm`, `cm`, `pt` or `in` (`20mm`, `0.5cm`, `12pt`).

## Text, headings and quotes

```json
{ "id": "…", "type": "text", "align": "justify", "content": [ { "type": "text", "value": "Dear " }, { "type": "field_ref", "path": "name" } ] }
```

- `text`: `align` (`left`, the default, `center`, `right` or `justify`), `indent`, `list_style`, `line_height`,
  `content`.
- `heading`: `level` 1 to 3, `align` (`left`, `center` or `right`), `indent`, `list_style`, `line_height`, `content`.
- `blockquote`: an indented passage with a rule on its left; `align`, `indent`, `content`.
- `indent` is 0 to 6. On a paragraph it is a first-line indent of that many `em`; on a quote it adds inset; on a list
  item it is the nesting depth. A leading `tab` in `content` also indents the first line.
- `list_style` makes the block a list item: `disc`, `circle`, `square`, `decimal`, `lower-alpha`, `upper-alpha`,
  `lower-roman` or `upper-roman`. Consecutive blocks with one style are one list.
- `line_height` is a multiplier as a string (`"1.5"`).

## Inline content

`content` is a list of inline items:

| `type` | members |
|---|---|
| `text` | `value`; formatting (below) |
| `field_ref` | `path`, or `expression` with `path: ""`; `format`, a display mask; formatting |
| `link` | `url`; `content`, a list of inline items |
| `linebreak`, `tab` | none |
| `page_number` | `total`: `false` (the default) prints the current page, `true` the page count; formatting. Only a header or footer has pages: in the body it prints `1` |
| `row_index` | formatting. The 1-based position of a repeated row; refused anywhere else |
| `signature` | a signing field (`signing.md`, "A document template with a signing field") |

Formatting, on `text`, `field_ref` and the counters:

- `marks`: any of `bold`, `italic`, `underline`, `strikethrough`, `code`, `highlight`, `subscript`, `superscript` and
  `underline_rule`, a solid line a small gap below the text;
- `font_family`: `serif`, `sans-serif` or `monospace`;
- `font_size`: `8pt`, `10pt`, `11pt`, `12pt`, `13pt`, `14pt`, `18pt` or `24pt`;
- on `text` and `field_ref` only: `color` and `background_color` as `#RRGGBB`; `tracking`, a length that spaces the
  letters (negative condenses a line to fit); `rule_width` and `rule_thickness` for `underline_rule` (`rule_width`
  may be a percentage of the text's width, and neither takes `em`).

## Display masks

A `field_ref`'s `format` prints its value through a mask of at most 64 characters. Without one the value prints as
stored. A mask AgentFlow does not recognise prints the value as stored too.

- **Dates** use the tokens `YYYY`, `MM`, `DD`, `HH` and `mm` (case matters); every other character prints as
  written, slashes included. A date-time prints in the organization's time zone.
- **Numbers** use `#` and `0` as digits, and the characters between them print as written, so both `#,##0.00` and
  `#.##0,00` work. The last separator is the decimal point, except a single separator followed by three or more
  digits, which is grouping (`#,##0` is a whole number with thousands grouped). For three decimals, write the grouping
  too (`#,##0.000`). Text in double quotes is a prefix or suffix: `#,##0.0"%"`.

```json
{ "type": "field_ref", "path": "due_date", "format": "DD/MM/YYYY" }
{ "type": "field_ref", "path": "amount", "format": "#,##0.00" }
```

## Columns

A `column_group` sets blocks side by side: `gutter` (a length, `0.5cm` by default) and `columns`, 2 to 4 of them, each
`{ "width", "blocks" }`. Give `width` as a percentage (`"50%"`) or a length: Word gives `fr` and `auto` an equal
share.

## Tables

There are two kinds. A **`static_table`** is a table you draw, cell by cell, and one of its rows may repeat once per
item of a list. A **`table`** is a data table: a header and one plain row per item. For line items with formatted
numbers, a row number or a total row, use a `static_table` with a repeated row: a data table prints each value as
stored, with no mask.

### A drawn table

- `column_widths`: relative widths, one per column (`[200, 80, 80]` makes the first column two and a half times the
  others), and so the number of columns. Left out, the columns are equal and the first row's cells, with their
  `col_span`s, set how many there are.
- `rows`: each `{ "cells": [ … ] }`. A cell is `{ "blocks": [ … ] }` with optional `header: true` (bold), `col_span`
  and `row_span` (2 or more), `background` (`#RRGGBB`) and `borders`, `{ "top", "right", "bottom", "left" }`, each
  `{ "size", "color", "style" }`: `size` in pixels, `0` for no line, `style` one of `solid`, `dashed`, `dotted` and
  `double`. A side left out takes the table's default.
- A cell holds blocks, so it can hold several paragraphs or another table.

### A repeated row

A row with `loop_source` is printed once per item of that list:

- `loop_source` is the path of an `array` property of `schema_json`.
- `loop_as` names the item and is required: a plain name of letters, digits and `_`, starting with a letter or `_`.
- Inside the row, a `field_ref` `path` names a field of the item itself (`quantity`, not `lines.quantity`), and an
  expression reads the item's fields by name.
- `loop_index_as` (optional) names the row's 1-based position, readable as a `field_ref` path or in an expression. It
  may not be `loop_as` or a field the item declares. A `row_index` item prints the position without naming it.
- The rows before and after it are ordinary rows that read the top-level fields: a header above it, a total below.
- One repeated row per table. Its cells hold only `text`, `heading` and `blockquote` blocks, with no `condition` and
  no signing field. It has no `row_span`, a merged cell above may not reach into it, and its cells fill the grid
  exactly.
- A list that is empty or missing prints no rows.

### A data table

`table`: `array_path` (an `array` property of `schema_json`), `columns` and optional `border` and `header_rows`.

- Each column is `{ "item_field_path", "header_label" }`, with optional `width` (a percentage or a length),
  `background` and `header_background`. `item_field_path` is a field of the item.
- A column with `expression` prints the expression, evaluated against each item (`quantity * unit_price`); its
  `item_field_path` is then a placeholder the install does not check.
- `border` is one `{ "size", "color", "style" }` for every line of the table.
- `header_rows` replaces the one-line header of `header_label`s with drawn rows, as in a drawn table: merged cells
  allowed, each row covering exactly as many columns as `columns` has. Its cells read the top-level fields. In the
  Word file it repeats at the top of each page.

### A table of line items

The record's `lines` list prints one row per line, with its number, the line's total and a total row under it:

```json config
{
  "key": "line_items",
  "name": "Line items",
  "description": "A record's lines with their totals.",
  "schema_json": {
    "type": "object",
    "properties": {
      "number": { "type": "string", "title": "Number" },
      "lines": {
        "type": "array",
        "title": "Lines",
        "items": {
          "type": "object",
          "properties": {
            "description": { "type": "string" },
            "quantity": { "type": "number" },
            "unit_price": { "type": "number" }
          }
        }
      }
    }
  },
  "template": {
    "version": 1,
    "blocks": [
      { "id": "0190f8f4-0000-7000-8000-000000000101", "type": "heading", "level": 1,
        "content": [{ "type": "text", "value": "Lines of " }, { "type": "field_ref", "path": "number" }] },
      { "id": "0190f8f4-0000-7000-8000-000000000102", "type": "static_table", "column_widths": [40, 260, 80, 100, 120],
        "rows": [
          { "cells": [
            { "header": true, "blocks": [{ "id": "0190f8f4-0000-7000-8000-000000000111", "type": "text", "content": [{ "type": "text", "value": "No." }] }] },
            { "header": true, "blocks": [{ "id": "0190f8f4-0000-7000-8000-000000000112", "type": "text", "content": [{ "type": "text", "value": "Description" }] }] },
            { "header": true, "blocks": [{ "id": "0190f8f4-0000-7000-8000-000000000113", "type": "text", "align": "right", "content": [{ "type": "text", "value": "Quantity" }] }] },
            { "header": true, "blocks": [{ "id": "0190f8f4-0000-7000-8000-000000000114", "type": "text", "align": "right", "content": [{ "type": "text", "value": "Unit price" }] }] },
            { "header": true, "blocks": [{ "id": "0190f8f4-0000-7000-8000-000000000115", "type": "text", "align": "right", "content": [{ "type": "text", "value": "Amount" }] }] }
          ] },
          { "loop_source": "lines", "loop_as": "line", "cells": [
            { "blocks": [{ "id": "0190f8f4-0000-7000-8000-000000000121", "type": "text", "content": [{ "type": "row_index" }] }] },
            { "blocks": [{ "id": "0190f8f4-0000-7000-8000-000000000122", "type": "text", "content": [{ "type": "field_ref", "path": "description" }] }] },
            { "blocks": [{ "id": "0190f8f4-0000-7000-8000-000000000123", "type": "text", "align": "right", "content": [{ "type": "field_ref", "path": "quantity" }] }] },
            { "blocks": [{ "id": "0190f8f4-0000-7000-8000-000000000124", "type": "text", "align": "right", "content": [{ "type": "field_ref", "path": "unit_price", "format": "#,##0.00" }] }] },
            { "blocks": [{ "id": "0190f8f4-0000-7000-8000-000000000125", "type": "text", "align": "right", "content": [{ "type": "field_ref", "path": "", "expression": "quantity * unit_price", "format": "#,##0.00" }] }] }
          ] },
          { "cells": [
            { "col_span": 4, "blocks": [{ "id": "0190f8f4-0000-7000-8000-000000000131", "type": "text", "align": "right", "content": [{ "type": "text", "value": "Total", "marks": ["bold"] }] }] },
            { "blocks": [{ "id": "0190f8f4-0000-7000-8000-000000000132", "type": "text", "align": "right", "content": [{ "type": "field_ref", "path": "", "expression": "sum(lines, \"quantity * unit_price\")", "format": "#,##0.00", "marks": ["bold"] }] }] }
          ] }
        ] }
    ]
  }
}
```

The step binds `/number` and `/lines` as in "The data a template reads", above.

## Text from Markdown

A `rich_text` block prints a value as Markdown: headings, lists, quotes, paragraphs, and bold, italic, code and links
inside them. Use it for an agent's written answer.

- `path` names a string property of `schema_json`, or `expression` computes the value. A block with neither prints
  nothing.
- `align`, and `font_family` and `font_size` as the base the Markdown's own structure builds on.
- `citation_mode`: `remove` (the default) strips an agent's citation markers, `link` turns each into a link to the
  document it cites.
- It may not sit in a repeated row.

```json
{ "id": "…", "type": "rich_text", "path": "summary" }
```

with `"/summary": ref("nodes.<agent step id>.output.<field>")` in the mapping.

## Pages

- `page_break` starts a new page. With `orientation` (`portrait` or `landscape`) or `page_margins` (four lengths)
  it also starts a section whose pages turn or have those margins, until another such break changes them. A break
  that starts a section must be at the top level of `blocks`, not in a column or a cell, and has no `condition`.
- `spacer` is vertical space: `{ "type": "spacer", "height": "12pt" }`.
- `settings` is the page setup, every member optional: `page_size` (`a4`, the only size), `orientation` of the first
  section, `margins` (four lengths), `default_font_family`, `default_font_size`, `leading` (line spacing, a length
  that may be in `em`), `space_before` and `space_after` (around each paragraph), `justify` (`true` justifies body
  text), and `rule_gap` and `rule_thickness` for `underline_rule`.

## Header and footer

`header` and `footer` are `{ "blocks": [ … ] }`, printed in the margin of every page. They take the body's blocks,
except a `page_break` and a signing field. This is where `page_number` counts:

```json
"footer": { "blocks": [ { "id": "…", "type": "text", "align": "center", "content": [
  { "type": "text", "value": "Page " }, { "type": "page_number" },
  { "type": "text", "value": " of " }, { "type": "page_number", "total": true } ] } ] }
```

## Expressions and conditions

An expression is written bare, without `{{ }}`, and uses the functions and filters of a workflow's `{{ }}`
templates (the guide's "Variables & expressions" page, `<AGENTFLOW_URL>/guides/en/quy-trinh/bien-va-bieu-thuc`).

- **Where**: a `field_ref`'s `expression`, a data-table column's `expression`, a `rich_text` block's `expression`
  and a block's `condition`.
- **What it reads**: the template's own fields, the values the mapping filled. It does not read `nodes.*`,
  `subject.*` or `input.*`: put what it needs into the mapping. In a repeated row or a data-table column it reads the
  item's fields by name, and the row's `loop_index_as`.
- Examples: `quantity * unit_price` in a row; `sum(lines, "quantity * unit_price")`, `count(lines)` and
  `"Paid" if paid else "Due"` at the top level.
- A `condition` shows its block when the value is true: a comparison (`discount > 0`), or a bare field, which is
  false when it is empty, zero or `false` (`lines` shows the block only when there are lines). For if and else, write
  two blocks with opposite conditions.

## A PDF and a Word file

`format: "both"` renders the template twice, once to each format, and each lands or fails on its own. They differ in:

- **Signing**: AgentFlow signs only PDFs, so a Word file has no signing fields (`signing.md`).
- **Widths**: a percentage or a length means the same in both; `fr` and `auto` only in the PDF.
- **Line height**: `line_height` is exact in Word and close in the PDF.
