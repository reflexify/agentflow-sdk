import { defineKitTag } from './kit-tag.js';

export const ACTIVITY_FEED_TAG = 'af-activity-feed';

/** Defines `af-activity-feed`, which `<agentflow-record-activity>` draws its lines with, loading its code the first time it is asked for. */
export function defineActivityFeed(registry: CustomElementRegistry = customElements): Promise<void> {
  return defineKitTag(ACTIVITY_FEED_TAG, () => import('./kit/ActivityFeed.svelte'), registry);
}
