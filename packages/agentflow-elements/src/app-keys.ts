import { getAppObjects, type AgentFlowClient } from '@reflexify/agentflow-sdk';

export class AppKeyMissing extends Error {
  constructor(
    readonly kind: 'entity' | 'workflow',
    readonly key: string,
  ) {
    super(`${kind}:${key} is not installed`);
    this.name = 'AppKeyMissing';
  }
}

export async function resolveKey(client: AgentFlowClient, kind: 'entity' | 'workflow', key: string): Promise<string> {
  const objects = getAppObjects(client);
  await objects.load();
  const id = objects.id(`${kind}:${key}`);
  if (id === null) throw new AppKeyMissing(kind, key);
  return id;
}
