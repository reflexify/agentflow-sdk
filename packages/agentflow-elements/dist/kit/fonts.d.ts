export interface KitFontFace {
    family: string;
    url: string;
    descriptors?: FontFaceDescriptors;
}
/**
 * Registers each face on `document.fonts`, which a shadow root shares, because a shadow root ignores `@font-face`. A face is
 * added once per page, keyed by family, url and descriptors; a family the host already provides is left alone. Resolves when
 * the faces have loaded. A face that fails is one warning and never a rejection: text falls back to the module's font stack.
 */
export declare function loadFonts(faces: readonly KitFontFace[]): Promise<void>;
//# sourceMappingURL=fonts.d.ts.map