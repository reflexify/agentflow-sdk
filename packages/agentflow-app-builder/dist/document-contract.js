import { isObject } from "./core.js";
// The first platform month whose builds read an entity's `work.document`. An older build takes `work` as JSON and
// ignores the key, so the package installs and its files are never read; such a package names this month.
export const DOCUMENT_PLATFORM = "2027.05";
// Whether an entity body holds the document contract.
export const holdsDocumentContract = (entity) => isObject(entity) && isObject(entity.work) && isObject(entity.work.document);
//# sourceMappingURL=document-contract.js.map