import type { AgentFlowClient } from '../client.js';
import type { RealtimeChannel } from '../realtime/channel.js';
/** The contract version this SDK's hosts implement, and the only one a module may declare today. */
export declare const APP_CONTRACT_VERSION = 1;
export interface AppTheme {
    mode: 'light' | 'dark';
    /** The palette: `azure`, `violet` or `crimson` inside AgentFlow; the app's own name standalone. */
    brand: string;
}
export interface AppContext {
    person: {
        id: string;
        name: string;
        email: string | null;
    };
    org: {
        id: string;
        name: string | null;
    };
    /** A BCP 47 tag: `vi` or `en` inside AgentFlow. It changes in place; `onLocaleChange` says when. */
    locale: string;
    /** The current theme. It changes in place; `onThemeChange` says when. */
    theme: AppTheme;
}
/**
 * What a host gives a module: plain data and functions, nothing of the host's own framework. A host
 * may be a plain object or a class instance.
 *
 * A path is everything after `basePath` in the address bar, pathname, query and fragment
 * (`/t/42?tab=notes#n3`), and always starts with `/`.
 */
export interface AppHost {
    contractVersion: typeof APP_CONTRACT_VERSION;
    /**
     * The SDK's typed client, as the signed-in person. In every host, `GET /app/objects` answers for the
     * module's own app: how a module turns the keys it ships with into this organization's ids.
     */
    api: AgentFlowClient;
    /**
     * An absolute URL for a published operation's `path` (`/attachments/a1/download`, query kept), under
     * the API `api` calls, that the browser can open with the person's credentials: a download link, an
     * image.
     */
    apiUrl(path: string): string;
    /** Where the module lives in the address bar: `/apps/<key>` inside AgentFlow, `/` standalone. */
    basePath: string;
    /** Go to `path` inside the module (`/`, `/t/42?tab=notes#n3`); the host owns the address bar. */
    navigate(path: string): void;
    /**
     * Called at once with the module's current path, then once for each change: `navigate`, back and
     * forward, and a fragment change.
     */
    onLocationChange(listener: (path: string) => void): () => void;
    /**
     * A real-time channel for the module, opened the first time it is read. Every read hands out the same
     * channel, and the host closes it when the module unmounts: a module never calls `close()` on it.
     */
    readonly realtime: RealtimeChannel;
    context: AppContext;
    /** Called whenever `context.theme` changes; not when it subscribes. */
    onThemeChange(listener: (theme: AppTheme) => void): () => void;
    /** Called whenever `context.locale` changes; not when it subscribes. */
    onLocaleChange(listener: (locale: string) => void): () => void;
    /** Where dialogs and popovers go: inside the module's shadow root, so the tokens reach them. */
    portalRoot: Element;
}
/** An app's UI module: the entry file's named export `mount`. */
export interface AppModule {
    /** Render into `root` (inside a shadow root: `root.getRootNode()`), and return how to stop. */
    mount(root: ShadowRoot | Element, host: AppHost): () => void;
}
/**
 * The module's own path for an address-bar `href` (`pathname + search + hash`) under `basePath`. It
 * always starts with `/` and keeps the query and fragment; a pathname outside `basePath` gives `/`.
 */
export declare function modulePath(href: string, basePath: string): string;
/** The address-bar `href` for the module's own `path` under `basePath`, query and fragment kept. */
export declare function hostPath(basePath: string, path: string): string;
//# sourceMappingURL=contract.d.ts.map