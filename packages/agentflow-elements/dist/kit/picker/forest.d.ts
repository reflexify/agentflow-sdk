import { type TreeNode } from '@reflexify/agentflow-sdk';
export interface Branch {
    node: TreeNode;
    depth: number;
    children: Branch[];
    /** The ancestors' labels, root first. */
    ancestry: string[];
}
/** Roots first in input order, children in input order; a node whose parent is absent is a root; a cycle is cut at the member the walk up from an unreached node meets first. */
export declare function forest(nodes: TreeNode[]): Branch[];
/** The ids whose branch holds a match for q (by label or code, through `matches`), with every ancestor of a match: what a search shows and opens. */
export declare function matching(roots: Branch[], q: string): {
    shown: Set<string>;
    open: Set<string>;
};
//# sourceMappingURL=forest.d.ts.map