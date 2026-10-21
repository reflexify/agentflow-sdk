export interface ModuleContainer {
  /** Where the module renders. */
  root: HTMLElement;
  /** Where its dialogs and popovers render: `AppHost.portalRoot`. */
  portalRoot: HTMLElement;
}

/**
 * Gives `element` the open shadow root a module renders in, holding the module's root and its portal
 * root. Calling it again on the same element empties and reuses the shadow root, since an element can
 * have only one: React's development double mount does exactly that.
 */
export function createModuleContainer(element: HTMLElement): ModuleContainer {
  const shadow = element.shadowRoot ?? element.attachShadow({ mode: 'open' });
  shadow.replaceChildren();
  const document = element.ownerDocument;
  const root = document.createElement('div');
  root.setAttribute('data-af-root', '');
  const portalRoot = document.createElement('div');
  portalRoot.setAttribute('data-af-portal', '');
  shadow.append(root, portalRoot);
  return { root, portalRoot };
}
