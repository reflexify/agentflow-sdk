import { Editor, type Extensions } from '@tiptap/core';
export declare function markdownExtensions(): Extensions;
export declare function roundTrip(markdown: string): string;
export declare function createMarkdownEditor(opts: {
    element: HTMLElement;
    content: string;
    editable: boolean;
    onUpdate(): void;
    onBlur(): void;
    onFocus(): void;
}): Editor;
//# sourceMappingURL=markdown.d.ts.map