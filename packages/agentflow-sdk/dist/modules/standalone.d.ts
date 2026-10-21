import { type AppHost } from './contract.js';
import { type AfPalette } from './tokens.js';
export interface StandaloneHostOptions {
    /** The element whose shadow root holds the module (see `createModuleContainer`); it carries the theme. */
    container: HTMLElement;
    portalRoot: Element;
    /** Where the SDK server is mounted, as `createAgentFlowServer` was given it. Default `/agentflow`. */
    sdkBasePath?: string;
    /** The module's place in the address bar. Default `/`. */
    basePath?: string;
    /** The app's brand, for `data-brand`. Default `agentflow`. */
    brand?: string;
    /** The token values for light and dark. Default AgentFlow's. */
    palette?: {
        light: AfPalette;
        dark: AfPalette;
    };
    /** For tests: the window whose address bar, colour scheme and language the host follows. */
    window?: Window;
    /** For tests. */
    fetch?: (request: Request) => Promise<Response>;
}
export interface StandaloneHost extends AppHost {
    /** Stop following the address bar, the colour scheme and the language, and close the channel if it was opened. */
    close(): void;
}
/**
 * The host an app's own site gives its module: the SDK server's proxy for the API and the real-time
 * channel, the browser's history for navigation, and the colour scheme and language for the context.
 * Signed-in only: it reads `/caller` first, and refuses with `AgentFlowError` when there is no session.
 */
export declare function createStandaloneHost(opts: StandaloneHostOptions): Promise<StandaloneHost>;
//# sourceMappingURL=standalone.d.ts.map