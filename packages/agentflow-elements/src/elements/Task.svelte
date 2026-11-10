<svelte:options
  customElement={{
    shadow: 'open',
    props: {
      record: { attribute: 'record', type: 'String' },
      entity: { attribute: 'entity', type: 'String' },
    },
  }}
/>

<script lang="ts">
  import type { AppTaskHandle, AppTaskState } from '@reflexify/agentflow-sdk';
  import { untrack } from 'svelte';
  import { provideContext, TASK_CONTEXT } from '../context.js';
  import type { TaskEventDetail } from '../types.js';
  import { useAgentFlow } from '../use-agentflow.svelte.js';

  let { record = undefined, entity = undefined }: { record?: string | null; entity?: string | null } = $props();

  const STATES = { loading: 'loading', ready: 'ready', not_found: 'not-found', finished: 'finished', error: 'error' } as const;

  const self = $host();
  const af = useAgentFlow(self);
  const known = $derived(af.current !== null);
  const tasks = $derived(af.current?.tasks ?? null);

  const provided = provideContext<AppTaskHandle | null>(self, TASK_CONTEXT, null);

  // Written when the handle reports, not from a render, so a listener for an event already reads the new state.
  function reflect(state: string) {
    if (self.getAttribute('state') !== state) self.setAttribute('state', state);
  }

  $effect(() => {
    const available = tasks;
    const recordId = record;
    const entityId = entity;
    if (!known) {
      reflect('loading');
      return;
    }
    if (!available) {
      reflect('unsupported');
      return;
    }
    if (!recordId) {
      reflect('not-found');
      return;
    }
    return untrack(() => {
      const handle = available.open(entityId ? { record: recordId, entity: entityId } : { record: recordId });
      let seen = handle.state.lastEvent?.seq ?? null;
      let closed = false;

      const apply = (state: AppTaskState) => {
        if (closed) return;
        reflect(STATES[state.status as keyof typeof STATES] ?? 'loading');
        const last = state.lastEvent;
        if (!last || last.seq === seen) return;
        seen = last.seq;
        const detail: TaskEventDetail = { recordId: state.record?.id ?? recordId, entityId: state.record?.entity ?? entityId ?? '' };
        if (last.actionId !== undefined) detail.actionId = last.actionId;
        self.dispatchEvent(new CustomEvent(`agentflow-task-${last.kind}`, { detail, bubbles: true, composed: true }));
      };

      apply(handle.state);
      const unsubscribe = handle.subscribe(apply);
      provided.set(handle);
      return () => {
        closed = true;
        unsubscribe();
        provided.set(null);
        handle.close();
      };
    });
  });

  $effect(() => () => provided.dispose());
</script>

<slot />

<style>
  :host {
    display: contents;
  }
</style>
