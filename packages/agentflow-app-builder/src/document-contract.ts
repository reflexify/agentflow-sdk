import { isObject } from "./core.js";

// The first platform month whose builds read an entity's own `document` member. An older build refuses the member,
// so a package whose entity declares it names this month.
export const DOCUMENT_PLATFORM = "2027.06";

// The code and text that refuse the document contract declared under `work`, the form it had before it became the
// entity's own member. The text is AgentFlow's, byte for byte.
export const DOCUMENT_CONTRACT_MOVED = "DOCUMENT_CONTRACT_MOVED";
export const DOCUMENT_CONTRACT_MOVED_TEXT = `The document contract is the entity's own "document" member since platform 2027.06, not part of "work".`;

// Whether an entity body holds the document contract.
export const holdsDocumentContract = (entity: unknown): boolean => isObject(entity) && isObject(entity.document);
