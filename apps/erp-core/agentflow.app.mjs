import { defineApp, merge } from "@reflexify/agentflow-app-builder";

export default defineApp({
  sections: merge([], []),
  entityOrder: [
    "company", "currency", "unit", "tax_code", "vendor", "item",
    "purchase_order", "purchase_order_line", "goods_receipt", "goods_receipt_line",
    "vendor_bill", "vendor_bill_line",
  ],
});
