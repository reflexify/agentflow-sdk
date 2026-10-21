import type { Draft, Json } from "./manifest.js";
export declare const UI_SOURCE = "ui/built";
export declare const UI_README = "# ui/\n\n`built/` is the UI module as the draft carried it: built output, not source. The build copies it into\n`package/ui/` as it is (`ui: { prebuilt: \"ui/built\" }` in `agentflow.app.mjs`). To change the module, write\nits source in this project and build it with Vite instead: point `ui` at a `viteConfig` and remove this folder.\n";
export declare function agentSource(draft: Draft, key: string): Json;
export declare function skillFile(draft: Draft, key: string): string;
export declare function dashboardSource(draft: Draft, key: string): Json;
//# sourceMappingURL=assets.d.ts.map