/**
 * On a page that is only the desk, a key pressed while nothing has focus is the desk's. The desk listens inside its
 * shadow root, which such a key never enters, so the page sends a copy into the module's root. This is page code: the
 * module itself never listens on the document, and AgentFlow's page, whose keys are its own, does not do this.
 */
export function forwardStrayKeys(doc: Document, into: Element): () => void {
  const onKey = (e: KeyboardEvent) => {
    if (e.target !== doc.body && e.target !== doc.documentElement) return;
    const copy = new KeyboardEvent('keydown', {
      key: e.key, code: e.code, location: e.location, repeat: e.repeat,
      ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, metaKey: e.metaKey,
      bubbles: true, cancelable: true, composed: true,
    });
    if (!into.dispatchEvent(copy)) e.preventDefault();
  };
  doc.addEventListener('keydown', onKey);
  return () => doc.removeEventListener('keydown', onKey);
}
