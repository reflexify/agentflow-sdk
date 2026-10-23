export declare const PUBLISHED_OPERATIONS: readonly [{
    readonly method: "POST";
    readonly path: "/app-catalog/submissions";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/app-catalog/submissions/{submission_id}";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/app-catalog/withdrawals";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/app-deployments";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/app-deployments";
    readonly idempotent: true;
}, {
    readonly method: "GET";
    readonly path: "/app-deployments/{deployment_id}";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/app-deployments/{deployment_id}/approve";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/app-deployments/{deployment_id}/cancel";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/app-deployments/{deployment_id}/plan";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/app-installations/{installation_id}/arm";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/app-installations/{installation_id}/objects";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/app-packages";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/app-packages/lint";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/app/objects";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/attachments";
    readonly idempotent: true;
}, {
    readonly method: "GET";
    readonly path: "/attachments/{attachment_id}";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/attachments/{attachment_id}/download";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/caller";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/dashboards";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/dashboards/{dashboard_id}";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/dashboards/{dashboard_id}/compute";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/entities";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/entities/{entity_id}";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/entities/{entity_id}/create-form";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/entities/{entity_id}/presence";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/entities/{entity_id}/records";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/entities/{entity_id}/records";
    readonly idempotent: true;
}, {
    readonly method: "DELETE";
    readonly path: "/entities/{entity_id}/records/{record_id}";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/entities/{entity_id}/records/{record_id}";
    readonly idempotent: false;
}, {
    readonly method: "PATCH";
    readonly path: "/entities/{entity_id}/records/{record_id}";
    readonly idempotent: true;
}, {
    readonly method: "PUT";
    readonly path: "/entities/{entity_id}/records/{record_id}";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/entities/{entity_id}/records/{record_id}/comments";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/entities/{entity_id}/records/{record_id}/comments";
    readonly idempotent: true;
}, {
    readonly method: "DELETE";
    readonly path: "/entities/{entity_id}/records/{record_id}/comments/{comment_id}";
    readonly idempotent: false;
}, {
    readonly method: "PATCH";
    readonly path: "/entities/{entity_id}/records/{record_id}/comments/{comment_id}";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/entities/{entity_id}/records/{record_id}/list-ops";
    readonly idempotent: true;
}, {
    readonly method: "GET";
    readonly path: "/entities/{entity_id}/records/{record_id}/mentioned-in";
    readonly idempotent: false;
}, {
    readonly method: "DELETE";
    readonly path: "/entities/{entity_id}/records/{record_id}/presence";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/entities/{entity_id}/records/{record_id}/presence";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/entities/{entity_id}/records/{record_id}/step";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/entities/{entity_id}/records/{record_id}/step/submit";
    readonly idempotent: true;
}, {
    readonly method: "POST";
    readonly path: "/entities/{entity_id}/records/{record_id}/work/assign";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/entities/{entity_id}/records/{record_id}/work/claim";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/entities/{entity_id}/records/{record_id}/work/reassign";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/entities/{entity_id}/records/{record_id}/work/release";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/entities/{entity_id}/records/batch-runs";
    readonly idempotent: true;
}, {
    readonly method: "GET";
    readonly path: "/entities/{entity_id}/records/batch-runs/{batch_run_id}";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/entities/{entity_id}/records/batch-runs/{batch_run_id}/members";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/entities/{entity_id}/records/count";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/entities/{entity_id}/records/query";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/events";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/events/stream";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/groups";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/groups/{group_id}";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/identities";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/instances";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/instances/{instance_id}";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/instances/{instance_id}/cancel";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/instances/{instance_id}/pause";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/instances/{instance_id}/resume";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/instances/{instance_id}/retry";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/mentions";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/mentions/people";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/notifications";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/notifications/{notification_id}/read";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/notifications/read-all";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/notifications/unread-count";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/platform";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/sandboxes";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/sandboxes";
    readonly idempotent: false;
}, {
    readonly method: "DELETE";
    readonly path: "/sandboxes/{sandbox_id}";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/sandboxes/{sandbox_id}";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/sandboxes/{sandbox_id}/sign-in-links";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/search";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/units";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/units/{unit_id}";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/users";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/users/{user_id}";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/webhook-event-types";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/webhook-subscriptions";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/webhook-subscriptions";
    readonly idempotent: true;
}, {
    readonly method: "DELETE";
    readonly path: "/webhook-subscriptions/{subscription_id}";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/webhook-subscriptions/{subscription_id}";
    readonly idempotent: false;
}, {
    readonly method: "PATCH";
    readonly path: "/webhook-subscriptions/{subscription_id}";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/webhook-subscriptions/{subscription_id}/deliveries";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/webhook-subscriptions/{subscription_id}/deliveries/{delivery_id}";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/webhook-subscriptions/{subscription_id}/deliveries/{delivery_id}/redeliver";
    readonly idempotent: true;
}, {
    readonly method: "GET";
    readonly path: "/webhook-subscriptions/{subscription_id}/history";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/webhook-subscriptions/{subscription_id}/pause";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/webhook-subscriptions/{subscription_id}/resume";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/webhook-subscriptions/{subscription_id}/rotate-secret";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/work";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/workflow-versions/{version_id}/start-form";
    readonly idempotent: false;
}, {
    readonly method: "GET";
    readonly path: "/workflows/{workflow_id}/input-contract";
    readonly idempotent: false;
}, {
    readonly method: "POST";
    readonly path: "/workflows/{workflow_id}/instances";
    readonly idempotent: true;
}, {
    readonly method: "GET";
    readonly path: "/workflows/startable";
    readonly idempotent: false;
}];
//# sourceMappingURL=operations.d.ts.map