import type { AppModule } from './contract.js';
/**
 * A custom element `<tag>` that mounts `module` in its own shadow root once it is connected and
 * given its host (`element.appHost = host`), and unmounts when it is removed. A tag already defined
 * is left as it is, so two bundles that both define it agree on the first.
 */
export declare function defineModuleElement(tag: string, module: AppModule, registry?: CustomElementRegistry): void;
/** The module that renders the custom element `tag`, handing it the host as its `appHost`. */
export declare function moduleFromElement(tag: string): AppModule;
//# sourceMappingURL=element.d.ts.map