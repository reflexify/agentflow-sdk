// Generated from openapi.json by scripts/gen-operations.mjs. Do not edit.
export const PUBLISHED_OPERATIONS = [
  {
    "method": "GET",
    "path": "/app-deployments",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/app-deployments",
    "idempotent": true
  },
  {
    "method": "GET",
    "path": "/app-deployments/{deployment_id}",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/app-deployments/{deployment_id}/approve",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/app-deployments/{deployment_id}/cancel",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/app-deployments/{deployment_id}/plan",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/app-packages",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/app-packages/lint",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/app/objects",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/attachments",
    "idempotent": true
  },
  {
    "method": "GET",
    "path": "/attachments/{attachment_id}",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/attachments/{attachment_id}/download",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/caller",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/dashboards",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/dashboards/{dashboard_id}",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/dashboards/{dashboard_id}/compute",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/entities",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/entities/{entity_id}",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/entities/{entity_id}/create-form",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/entities/{entity_id}/presence",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/entities/{entity_id}/records",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/entities/{entity_id}/records",
    "idempotent": true
  },
  {
    "method": "DELETE",
    "path": "/entities/{entity_id}/records/{record_id}",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/entities/{entity_id}/records/{record_id}",
    "idempotent": false
  },
  {
    "method": "PATCH",
    "path": "/entities/{entity_id}/records/{record_id}",
    "idempotent": true
  },
  {
    "method": "PUT",
    "path": "/entities/{entity_id}/records/{record_id}",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/entities/{entity_id}/records/{record_id}/list-ops",
    "idempotent": true
  },
  {
    "method": "DELETE",
    "path": "/entities/{entity_id}/records/{record_id}/presence",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/entities/{entity_id}/records/{record_id}/presence",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/entities/{entity_id}/records/{record_id}/step",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/entities/{entity_id}/records/{record_id}/step/submit",
    "idempotent": true
  },
  {
    "method": "POST",
    "path": "/entities/{entity_id}/records/{record_id}/work/assign",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/entities/{entity_id}/records/{record_id}/work/claim",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/entities/{entity_id}/records/{record_id}/work/reassign",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/entities/{entity_id}/records/{record_id}/work/release",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/entities/{entity_id}/records/batch-runs",
    "idempotent": true
  },
  {
    "method": "GET",
    "path": "/entities/{entity_id}/records/batch-runs/{batch_run_id}",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/entities/{entity_id}/records/batch-runs/{batch_run_id}/members",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/entities/{entity_id}/records/count",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/entities/{entity_id}/records/query",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/events",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/events/stream",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/groups",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/groups/{group_id}",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/identities",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/instances",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/instances/{instance_id}",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/instances/{instance_id}/cancel",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/instances/{instance_id}/pause",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/instances/{instance_id}/resume",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/instances/{instance_id}/retry",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/notifications",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/notifications/{notification_id}/read",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/notifications/read-all",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/notifications/unread-count",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/platform",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/search",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/units",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/units/{unit_id}",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/users",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/users/{user_id}",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/webhook-event-types",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/webhook-subscriptions",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/webhook-subscriptions",
    "idempotent": true
  },
  {
    "method": "DELETE",
    "path": "/webhook-subscriptions/{subscription_id}",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/webhook-subscriptions/{subscription_id}",
    "idempotent": false
  },
  {
    "method": "PATCH",
    "path": "/webhook-subscriptions/{subscription_id}",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/webhook-subscriptions/{subscription_id}/deliveries",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/webhook-subscriptions/{subscription_id}/deliveries/{delivery_id}",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/webhook-subscriptions/{subscription_id}/deliveries/{delivery_id}/redeliver",
    "idempotent": true
  },
  {
    "method": "GET",
    "path": "/webhook-subscriptions/{subscription_id}/history",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/webhook-subscriptions/{subscription_id}/pause",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/webhook-subscriptions/{subscription_id}/resume",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/webhook-subscriptions/{subscription_id}/rotate-secret",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/work",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/workflow-versions/{version_id}/start-form",
    "idempotent": false
  },
  {
    "method": "GET",
    "path": "/workflows/{workflow_id}/input-contract",
    "idempotent": false
  },
  {
    "method": "POST",
    "path": "/workflows/{workflow_id}/instances",
    "idempotent": true
  },
  {
    "method": "GET",
    "path": "/workflows/startable",
    "idempotent": false
  }
] as const satisfies readonly { method: string; path: string; idempotent: boolean }[];
