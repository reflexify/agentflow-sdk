import { matches, type TreeNode } from '@reflexify/agentflow-sdk';

export interface Branch {
  node: TreeNode;
  depth: number;
  children: Branch[];
  /** The ancestors' labels, root first. */
  ancestry: string[];
}

/** Roots first in input order, children in input order; a node whose parent is absent is a root; a cycle is cut at the member the walk up from an unreached node meets first. */
export function forest(nodes: TreeNode[]): Branch[] {
  // A repeated id would draw one node twice, so the first wins.
  const byId = new Map<string, TreeNode>();
  for (const node of nodes) if (!byId.has(node.id)) byId.set(node.id, node);
  const kids = new Map<string, TreeNode[]>();
  const roots = new Set<string>();
  for (const node of byId.values()) {
    if (node.parentId == null || !byId.has(node.parentId)) roots.add(node.id);
    else if (kids.has(node.parentId)) kids.get(node.parentId)!.push(node);
    else kids.set(node.parentId, [node]);
  }
  // A node no root reaches sits on a cycle, or under one. Its parents are followed up until an id comes round again, and
  // that member, the first of the cycle the walk meets, becomes a root, which reaches the rest of the cycle and the node
  // the walk began at: a node under a cycle belongs under it, not at a root of its own.
  const reached = new Set<string>();
  const reach = (id: string) => {
    if (reached.has(id)) return;
    reached.add(id);
    for (const kid of kids.get(id) ?? []) reach(kid.id);
  };
  for (const id of roots) reach(id);
  for (const start of byId.keys()) {
    if (reached.has(start)) continue;
    const walked = new Set<string>();
    let at = start;
    // An unreached node's parent is a node of the set, itself unreached, so the walk ends only by coming round.
    while (!walked.has(at)) {
      walked.add(at);
      at = byId.get(at)!.parentId!;
    }
    roots.add(at);
    reach(at);
  }
  // Every node has one parent, so a cycle is reached only through the node cut from it, which is left out as a child.
  const grow = (node: TreeNode, depth: number, ancestry: string[]): Branch => {
    const below = [...ancestry, node.label];
    const children = (kids.get(node.id) ?? []).filter((kid) => !roots.has(kid.id)).map((kid) => grow(kid, depth + 1, below));
    return { node, depth, children, ancestry };
  };
  return [...byId.values()].filter((node) => roots.has(node.id)).map((node) => grow(node, 0, []));
}

/** The ids whose branch holds a match for q (by label or code, through `matches`), with every ancestor of a match: what a search shows and opens. */
export function matching(roots: Branch[], q: string): { shown: Set<string>; open: Set<string> } {
  const shown = new Set<string>();
  const open = new Set<string>();
  const visit = (branch: Branch): boolean => {
    let below = false;
    for (const child of branch.children) if (visit(child)) below = true;
    if (below) open.add(branch.node.id);
    const hit = below || matches(branch.node.label, q) || matches(branch.node.code, q);
    if (hit) shown.add(branch.node.id);
    return hit;
  };
  for (const root of roots) visit(root);
  return { shown, open };
}
