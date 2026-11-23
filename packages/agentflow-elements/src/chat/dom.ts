export function setAttributes(node: Element, attributes: Record<string, string>): void {
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
}

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attributes: Record<string, string>, ...children: Node[]): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  setAttributes(node, attributes);
  node.append(...children);
  return node;
}

export function setText(node: Node, text: string): void {
  if (node.textContent !== text) node.textContent = text;
}
