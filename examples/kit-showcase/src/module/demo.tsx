import { createModuleContainer, createStandaloneHost } from '@reflexify/agentflow-sdk';
import { mountShowcase } from './mount.js';

/**
 * The showcase on the standalone host, following the browser's language and colour scheme. The host reads who is
 * signed in first; with no SDK server behind this page, a made-up person answers.
 */
async function mountDemo(element: HTMLElement): Promise<void> {
  const caller = { id: 'demo', kind: 'person', display_name: 'Demo', email: null, org_id: 'demo', org_name: 'Acme' };
  const fetch = async (request: Request) =>
    new URL(request.url).pathname.endsWith('/caller') ? Response.json(caller) : new Response(null, { status: 404 });
  const { root, portalRoot } = createModuleContainer(element);
  const host = await createStandaloneHost({ container: element, portalRoot, fetch });
  mountShowcase(root, host);
}

void mountDemo(document.getElementById('showcase')!);
