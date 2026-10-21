export class AgentFlowError extends Error {
    status;
    code;
    detail;
    requestId;
    fieldErrors;
    constructor(status, code, detail, requestId, fieldErrors) {
        super(detail ? `${code}: ${detail}` : code);
        this.status = status;
        this.code = code;
        this.detail = detail;
        this.requestId = requestId;
        this.fieldErrors = fieldErrors;
        this.name = 'AgentFlowError';
    }
}
export async function ok(result) {
    const { data, error, response } = await result;
    if (response.ok && error === undefined)
        return data;
    const p = (error ?? {});
    throw new AgentFlowError(response.status, p.type ?? `HTTP_${response.status}`, p.detail, p.request_id, p.field_errors ?? undefined);
}
//# sourceMappingURL=errors.js.map