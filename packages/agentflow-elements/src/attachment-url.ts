import type { AgentFlowClient } from '@reflexify/agentflow-sdk';

/**
 * The address a file downloads from, under the API `client` calls: what a link or a new tab needs, which the typed client does
 * not give. The client builds the request, so it is asked for one and its fetch is replaced by one that reads the address and
 * sends nothing. The request is built before the call returns, which keeps this synchronous: a tab opened from a click has to
 * be opened in the click.
 */
export function attachmentUrl(client: AgentFlowClient, id: string): string {
  let url = '';
  void client.GET('/attachments/{attachment_id}/download', {
    params: { path: { attachment_id: id } },
    fetch: (request) => {
      url = request.url;
      return Promise.resolve(new Response(null, { status: 204 }));
    },
  });
  return url;
}
