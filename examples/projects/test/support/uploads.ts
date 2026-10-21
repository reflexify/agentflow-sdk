import { File as NodeFile } from 'node:buffer';
import { afterEach, beforeEach } from 'vitest';

/**
 * Builds every upload in the calling test file from Node's own FormData and File. Vitest's jsdom bridge cannot hand
 * jsdom's FormData to Node's Request: it reads a jsdom internal that jsdom 30 no longer has, and the upload throws.
 * A browser's upload is built from its own FormData and File, which these stand in for. Call it at the top level.
 */
export function useNodeUploads(): void {
  let restore: (() => void) | null = null;
  beforeEach(async () => {
    const NodeFormData = (await new Response(new URLSearchParams('a=1')).formData()).constructor as typeof FormData;
    const was = { FormData: globalThis.FormData, File: globalThis.File };
    globalThis.FormData = NodeFormData;
    globalThis.File = NodeFile as unknown as typeof File;
    restore = () => {
      globalThis.FormData = was.FormData;
      globalThis.File = was.File;
    };
  });
  afterEach(() => {
    restore?.();
    restore = null;
  });
}
