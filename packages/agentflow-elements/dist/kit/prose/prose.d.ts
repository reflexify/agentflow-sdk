export type ProseInline = {
    kind: 'text';
    text: string;
} | {
    kind: 'break';
} | {
    kind: 'code';
    text: string;
} | {
    kind: 'strong' | 'em' | 'del';
    children: ProseInline[];
} | {
    kind: 'link';
    href: string;
    children: ProseInline[];
} | {
    kind: 'mention';
    ref: string;
    label: string;
};
export type ProseBlock = {
    kind: 'paragraph';
    children: ProseInline[];
} | {
    kind: 'heading';
    level: 1 | 2 | 3 | 4 | 5 | 6;
    children: ProseInline[];
} | {
    kind: 'list';
    ordered: boolean;
    start: number;
    items: {
        checked: boolean | null;
        children: ProseBlock[];
    }[];
} | {
    kind: 'quote';
    children: ProseBlock[];
} | {
    kind: 'code';
    text: string;
} | {
    kind: 'rule';
} | {
    kind: 'plain';
    text: string;
} | {
    kind: 'table';
    align: ('left' | 'center' | 'right' | null)[];
    head: ProseInline[][];
    rows: ProseInline[][][];
};
/** A URL with a scheme survives only as http, https, irc, ircs, mailto or xmpp; one without a scheme survives as written. Null otherwise. */
export declare function safeHref(url: string): string | null;
/**
 * Markdown as the platform's MarkdownView reads it: GFM, a single newline as a break, raw HTML as its own characters, an image as its alt text, and a mention token as a mention. A link is kept when `safeHref` keeps it or its URL starts with one of `schemes` (each ending in `:`). Only the first 20,000 characters are read; the rest is one block of plain text.
 */
export declare function proseOf(body: string, schemes?: readonly string[]): ProseBlock[];
//# sourceMappingURL=prose.d.ts.map