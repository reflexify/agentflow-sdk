import type { MentionMenuSource } from '@reflexify/agentflow-sdk';
import { useMemo } from 'react';
import type { MentionTarget } from '../api/projects-api.js';
import type { MentionMap } from '../model/types.js';
import type { TextKey } from '../text.js';
import { useProjects } from '../data/context.js';

/** The `@` menu for the texts of one record, or none while the viewer cannot write them. */
export function useMentionSource(target: MentionTarget | null): MentionMenuSource | null {
  const { api, lang } = useProjects();
  const entity = target?.entity;
  const record = target?.record;
  return useMemo(() => (entity && record ? api.mentionSource({ entity, record }, lang) : null), [api, lang, entity, record]);
}

const TOKEN = /@\[((?:\\.|[^\]\\])*)\]\(mention:([^)]*)\)/g;

/**
 * A text with its mention tokens as the words a reader sees, for a name that must be plain text. A target the map does
 * not describe is restricted, whatever label the token stores.
 */
export function plainMentions(text: string, map: MentionMap, tr: (key: TextKey) => string): string {
  return text.replace(TOKEN, (_, label: string, ref: string) => {
    const found = map[ref];
    const person = ref.startsWith('user/');
    if (!found || found.state === 'restricted') return `@${tr(person ? 'mentionRestrictedPerson' : 'mentionRestricted')}`;
    if (found.state === 'deleted') return person ? `@${label.replace(/\\(.)/g, '$1')}` : `@${tr('mentionDeleted')}`;
    return `@${found.label}`;
  });
}
