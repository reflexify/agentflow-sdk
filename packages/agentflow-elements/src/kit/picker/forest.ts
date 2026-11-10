import { matches, type TreeNode } from '@reflexify/agentflow-sdk';

export interface Branch {
  node: TreeNode;
  depth: number;
  children: Branch[];
  /** The ancestors' labels, root first. */
  ancestry: string[];
}

/** Roots first in input order, children in input order; a node whose parent is absent is a root; a cycle is cut at the node first seen. */
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
  // A node no root reaches sits on a cycle, or under one: the first of them in input order becomes a root, which reaches
  // the rest of its cycle.
  const reached = new Set<string>();
  const reach = (id: string) => {
    if (reached.has(id)) return;
    reached.add(id);
    for (const kid of kids.get(id) ?? []) reach(kid.id);
  };
  for (const id of roots) reach(id);
  for (const id of byId.keys()) {
    if (reached.has(id)) continue;
    roots.add(id);
    reach(id);
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
