export declare const COMMENT_THREAD_TAG = "af-comment-thread";
/** Every kit tag a comment thread draws: the thread itself, the body of a comment, the editor, the file picker and the delete confirmation. */
export declare const COMMENT_THREAD_TAGS: readonly string[];
/** Whether a page's own kit already defined every one of them, so that nothing needs loading. */
export declare const commentThreadDefined: (registry?: CustomElementRegistry) => boolean;
/**
 * Defines `af-comment-thread` and the kit elements it draws with, which `<agentflow-record-comments>` needs, loading their code
 * the first time a thread is drawn. The editor loads its own parser only when a composer or an edit opens. A tag the page's own
 * kit registered keeps its copy, and then nothing is loaded for it.
 */
export declare function defineCommentThread(registry?: CustomElementRegistry): Promise<void>;
//# sourceMappingURL=comment-thread.d.ts.map