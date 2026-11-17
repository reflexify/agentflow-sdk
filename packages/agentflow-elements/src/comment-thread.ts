import { defineKitTag } from './kit-tag.js';

export const COMMENT_THREAD_TAG = 'af-comment-thread';

/** Every kit tag a comment thread draws: the thread itself, the body of a comment, the editor, the file picker and the delete confirmation. */
export const COMMENT_THREAD_TAGS: readonly string[] = [COMMENT_THREAD_TAG, 'af-markdown', 'af-rich-editor', 'af-file-upload', 'af-confirm'];

/** Whether a page's own kit already defined every one of them, so that nothing needs loading. */
export const commentThreadDefined = (registry: CustomElementRegistry = customElements): boolean => COMMENT_THREAD_TAGS.every((tag) => registry.get(tag) !== undefined);

/**
 * Defines `af-comment-thread` and the kit elements it draws with, which `<agentflow-record-comments>` needs, loading their code
 * the first time a thread is drawn. The editor loads its own parser only when a composer or an edit opens. A tag the page's own
 * kit registered keeps its copy, and then nothing is loaded for it.
 */
export async function defineCommentThread(registry: CustomElementRegistry = customElements): Promise<void> {
  await Promise.all([
    defineKitTag(COMMENT_THREAD_TAG, () => import('./kit/CommentThread.svelte'), registry),
    defineKitTag('af-markdown', () => import('./kit/Markdown.svelte'), registry),
    defineKitTag('af-rich-editor', () => import('./kit/RichEditor.svelte'), registry),
    defineKitTag('af-file-upload', () => import('./kit/FileUpload.svelte'), registry),
    defineKitTag('af-confirm', () => import('./kit/Confirm.svelte'), registry),
  ]);
}
