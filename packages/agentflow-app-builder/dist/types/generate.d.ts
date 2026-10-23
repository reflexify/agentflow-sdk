/** The manifest and each object's body by logical key (`objects/entity_field/case__title.json` is `entity_field:case/title`). */
export declare function payloadObjects(files: Map<string, Uint8Array>): {
    manifest: unknown;
    objects: Map<string, unknown>;
};
/** The text of `src/generated/app.ts` for a package: its manifest and each object's body by logical key. */
export declare function generateTypes(manifest: unknown, objects: Map<string, unknown>): string;
//# sourceMappingURL=generate.d.ts.map