import { Editor, type Extensions } from '@tiptap/core';
import { type MentionOptions } from './mention.js';
export { exitSuggestion } from '@tiptap/suggestion';
export { flatten } from './mention.js';
export declare function markdownExtensions(opts?: {
    mention?: MentionOptions;
    singleLine?: boolean;
}): Extensions;
export declare function roundTrip(markdown: string): string;
export declare function createMarkdownEditor(opts: {
    element: HTMLElement;
    content: string;
    editable: boolean;
    onUpdate(): void;
    onBlur(): void;
    onFocus(): void;
    mention?: MentionOptions;
    singleLine?: boolean;
}): Editor;
//# sourceMappingURL=markdown.d.ts.map