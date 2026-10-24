import { createModuleContainer } from './container.js';
import { applyTheme } from './tokens.js';
/**
 * `host` with its own `portalRoot`: every other member forwarded, read when the module reads it. Not
 * `Object.create(host)`: a getter or method reached through a derived object runs with that object as
 * `this`, so a class host's private fields throw and a getter that caches would cache on the copy. Not
 * a spread either: that would read `realtime` and open the stream.
 */
function forwardingHost(host, portalRoot) {
    return {
        get contractVersion() {
            return host.contractVersion;
        },
        get api() {
            return host.api;
        },
        get basePath() {
            return host.basePath;
        },
        get realtime() {
            return host.realtime;
        },
        get assistant() {
            return host.assistant;
        },
        get context() {
            return host.context;
        },
        apiUrl: (path) => host.apiUrl(path),
        navigate: (path) => host.navigate(path),
        onLocationChange: (listener) => host.onLocationChange(listener),
        onThemeChange: (listener) => host.onThemeChange(listener),
        onLocaleChange: (listener) => host.onLocaleChange(listener),
        portalRoot,
    };
}
/**
 * A custom element `<tag>` that mounts `module` in its own shadow root once it is connected and
 * given its host (`element.appHost = host`), and unmounts when it is removed. A tag already defined
 * is left as it is, so two bundles that both define it agree on the first.
 */
export function defineModuleElement(tag, module, registry = customElements) {
    if (registry.get(tag))
        return;
    registry.define(tag, class extends HTMLElement {
        #host;
        #unmount;
        #stopTheme;
        get appHost() {
            return this.#host;
        }
        set appHost(host) {
            this.#host = host;
            this.#render();
        }
        connectedCallback() {
            this.#render();
        }
        disconnectedCallback() {
            this.#stop();
        }
        #render() {
            this.#stop();
            const host = this.#host;
            if (!this.isConnected || !host)
                return;
            const { root, portalRoot } = createModuleContainer(this);
            applyTheme(this, host.context.theme);
            this.#stopTheme = host.onThemeChange((theme) => applyTheme(this, theme));
            // The module's dialogs go in this element's shadow root, beside its styles.
            this.#unmount = module.mount(root, forwardingHost(host, portalRoot));
        }
        #stop() {
            const stopTheme = this.#stopTheme;
            const unmount = this.#unmount;
            this.#stopTheme = undefined;
            this.#unmount = undefined;
            stopTheme?.();
            unmount?.();
        }
    });
}
/** The module that renders the custom element `tag`, handing it the host as its `appHost`. */
export function moduleFromElement(tag) {
    return {
        mount(root, host) {
            // The element renders when it gets its host; set last, so a module that throws throws here,
            // to the caller, rather than from a custom-element callback the caller never sees.
            if (!customElements.get(tag))
                throw new Error(`<${tag}> is not defined`);
            const element = root.ownerDocument.createElement(tag);
            root.append(element);
            element.appHost = host;
            return () => element.remove();
        },
    };
}
//# sourceMappingURL=element.js.map