import type { ResolvedMention } from '@reflexify/agentflow-sdk';
import type { KitStrings } from '../text.js';

export interface MarkdownViewProps {
  value: string | null;
  mentions: Record<string, ResolvedMention> | null;
  schemes: readonly string[] | null;
  text: Required<KitStrings>;
  host: HTMLElement;
}
