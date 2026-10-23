<svelte:options
  customElement={{
    shadow: 'open',
    props: {
      basePath: { attribute: 'base-path', type: 'String' },
      locale: { attribute: 'locale', type: 'String' },
      // strings and fetchImpl are property-only; see ../props.ts.
    },
  }}
/>

<script lang="ts">
  import { createAgentFlowClient, ok, proxyAdapter } from '@reflexify/agentflow-sdk';
  import { untrack } from 'svelte';
  import { basePathOf, DEFAULT_BASE_PATH } from '../base-path.js';
  import { provideContext, type AgentFlowContext } from '../context.js';
  import { APP_KEY_MISSING, classify, type Problem } from '../errors.js';
  import { resolveLocale, translator, type Strings } from '../i18n.js';
  import { functionProp, objectProp } from '../props.js';
  import type { Caller, ProviderState } from '../types.js';

  let {
    basePath = DEFAULT_BASE_PATH,
    locale = undefined,
    strings = {},
    fetchImpl = undefined,
  }: { basePath?: string; locale?: string; strings?: Strings; fetchImpl?: typeof fetch } = $props();

  const self = $host();
  let providerState = $state<ProviderState>('loading');
  let caller = $state<Caller | null>(null);

  // Created once from the attributes present at connect; changing base-path
  // later does not move an element that is already talking to the API.
  // `untrack` reads the initial values without Svelte's "only captures the
  // initial value" warning, which --fail-on-warnings would make fatal.
  const client = untrack(() =>
    createAgentFlowClient({
      baseUrl: `${location.origin}${basePathOf(basePath)}/api`,
      auth: proxyAdapter(),
      fetch: functionProp<typeof fetch>(fetchImpl, 'fetchImpl') ?? globalThis.fetch.bind(globalThis),
    }),
  );

  // A load still in flight when the element is destroyed must not speak: a host that is
  // removed and re-added gets a new instance, whose own load reports for it.
  let destroyed = false;

  const emit = (type: string, detail: unknown) => {
    if (!destroyed) self.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
  };

  // data-state is written here, not in an effect, so a listener for the event that
  // announces a change already reads the new state from it.
  function setState(next: ProviderState) {
    if (destroyed) return;
    providerState = next;
    self.dataset.state = next;
  }
  self.dataset.state = 'loading';

  // `loading` marks the provider's own GET /caller, whose failure is the `error` state.
  function fail(error: unknown, loading: boolean): Problem | null {
    const c = classify(error);
    if (c.type === 'signed-out') {
      if (providerState !== 'signed-out') {
        setState('signed-out');
        emit('signed-out', {});
      }
      return null;
    }
    if (c.type === 'access-lost') {
      if (providerState !== 'access-lost') {
        setState('access-lost');
        emit('access-lost', { code: c.code });
      }
      return null;
    }
    if (loading) setState('error');
    emit('request-failed', { code: c.problem.code, status: c.problem.status, detail: c.problem.detail, requestId: c.problem.requestId });
    return c.problem;
  }

  // By shape, like errors.ts: a key that names nothing is the page's mistake, not a failed request.
  function report(error: unknown): Problem | null {
    const e = error as { name?: unknown; kind?: unknown; key?: unknown } | null;
    if (e?.name === 'AppKeyMissing' && typeof e.kind === 'string' && typeof e.key === 'string') {
      return { code: APP_KEY_MISSING, status: 0, detail: context.t('notInstalled', { key: `${e.kind}:${e.key}` }) };
    }
    return fail(error, false);
  }

  const lang = $derived(resolveLocale(locale, typeof navigator === 'undefined' ? undefined : navigator.language));
  const context = $derived<AgentFlowContext>({ state: providerState, caller, client, locale: lang, t: translator(lang, objectProp<Strings>(strings, 'strings') ?? {}), report });

  const handle = provideContext(self, untrack(() => context));

  $effect(() => handle.set(context));
  $effect(() => () => {
    destroyed = true;
    handle.dispose();
  });

  (async () => {
    try {
      const me = (await ok(client.GET('/caller'))) as Caller;
      caller = me;
      setState('ready');
      emit('session-ready', { caller: me });
    } catch (error) {
      fail(error, true);
    }
  })();
</script>

<slot />
