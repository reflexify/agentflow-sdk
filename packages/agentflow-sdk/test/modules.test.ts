// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import {
  AF_DEFAULT_PALETTE,
  AF_TOKENS,
  applyTheme,
  createModuleContainer,
  defineModuleElement,
  hostPath,
  modulePath,
  moduleFromElement,
} from '../src/index.js';
import type { AppContext, AppHost, AppModule, AppTheme } from '../src/index.js';

type FakeHost = AppHost & {
  themeListeners: Set<(theme: AppTheme) => void>;
  changeTheme(theme: AppTheme): void;
};

function fakeHost(): FakeHost {
  const themeListeners = new Set<(theme: AppTheme) => void>();
  return {
    contractVersion: 2,
    api: {} as AppHost['api'],
    apiUrl: (path) => `https://agentflow.test/api/v1${path}`,
    basePath: '/apps/desk',
    navigate: vi.fn(),
    onLocationChange: () => () => {},
    get realtime(): AppHost['realtime'] {
      throw new Error('not used');
    },
    context: {
      person: { id: 'u1', name: 'Bo Tran', email: null },
      org: { id: 'o1', name: 'Acme' },
      locale: 'en',
      theme: { mode: 'light', brand: 'azure' },
    },
    onThemeChange: (listener) => {
      themeListeners.add(listener);
      return () => {
        themeListeners.delete(listener);
      };
    },
    onLocaleChange: () => () => {},
    portalRoot: document.createElement('div'),
    themeListeners,
    changeTheme: (theme) => {
      for (const listener of [...themeListeners]) listener(theme);
    },
  };
}

/** A host written as a class: private fields, and a channel its getter opens once and keeps. */
class ClassHost implements AppHost {
  readonly contractVersion = 2 as const;
  readonly #assistant = { setContext: vi.fn() };
  readonly api = {} as AppHost['api'];
  readonly basePath = '/apps/desk';
  readonly portalRoot = document.createElement('div');
  context: AppContext = {
    person: { id: 'u1', name: 'Bo Tran', email: null },
    org: { id: 'o1', name: 'Acme' },
    locale: 'en',
    theme: { mode: 'light', brand: 'azure' },
  };
  opened = 0;
  #apiBase = 'https://agentflow.test/api/v1';
  #channel: AppHost['realtime'] | undefined;
  #path = '/t/1';
  #paths = new Set<(path: string) => void>();
  #themes = new Set<(theme: AppTheme) => void>();
  #locales = new Set<(locale: string) => void>();

  get assistant(): NonNullable<AppHost['assistant']> {
    return this.#assistant;
  }

  get realtime(): AppHost['realtime'] {
    if (!this.#channel) {
      this.opened += 1;
      this.#channel = { close: vi.fn() } as unknown as AppHost['realtime'];
    }
    return this.#channel;
  }

  apiUrl(path: string): string {
    return `${this.#apiBase}${path}`;
  }

  navigate(path: string): void {
    this.#path = path;
    for (const listener of [...this.#paths]) listener(path);
  }

  onLocationChange(listener: (path: string) => void): () => void {
    this.#paths.add(listener);
    listener(this.#path);
    return () => void this.#paths.delete(listener);
  }

  onThemeChange(listener: (theme: AppTheme) => void): () => void {
    this.#themes.add(listener);
    return () => void this.#themes.delete(listener);
  }

  onLocaleChange(listener: (locale: string) => void): () => void {
    this.#locales.add(listener);
    return () => void this.#locales.delete(listener);
  }

  setLocale(locale: string): void {
    this.context.locale = locale;
    for (const listener of [...this.#locales]) listener(locale);
  }
}

describe('the module contract', () => {
  it('puts the module root and its portal root in an open shadow root', () => {
    const element = document.createElement('div');
    const { root, portalRoot } = createModuleContainer(element);
    expect(element.shadowRoot?.mode).toBe('open');
    expect(root.getRootNode()).toBe(element.shadowRoot);
    expect(portalRoot.getRootNode()).toBe(element.shadowRoot);
    expect([...element.shadowRoot!.children]).toEqual([root, portalRoot]);
  });

  it('empties and reuses a container that already has a shadow root', () => {
    const element = document.createElement('div');
    const first = createModuleContainer(element);
    first.root.textContent = 'left over';
    const second = createModuleContainer(element);
    expect(second.root).not.toBe(first.root);
    expect(element.shadowRoot!.children).toHaveLength(2);
    expect(element.shadowRoot!.textContent).toBe('');
  });

  it('applies a theme as data, and with a palette as every token', () => {
    const element = document.createElement('div');
    applyTheme(element, { mode: 'dark', brand: 'desk' }, AF_DEFAULT_PALETTE);
    expect(element.dataset.theme).toBe('dark');
    expect(element.dataset.brand).toBe('desk');
    for (const token of AF_TOKENS) {
      expect(element.style.getPropertyValue(token), token).toBe(AF_DEFAULT_PALETTE.dark[token]);
    }
    applyTheme(element, { mode: 'light', brand: 'desk' });
    expect(element.dataset.theme).toBe('light');
    expect(element.style.getPropertyValue('--af-bg')).toBe(AF_DEFAULT_PALETTE.dark['--af-bg']);
  });

  it('names fourteen tokens, and the default palette fills every one in both modes', () => {
    expect(AF_TOKENS).toEqual([
      '--af-bg', '--af-surface', '--af-fg', '--af-muted-fg', '--af-border', '--af-primary', '--af-primary-fg',
      '--af-danger', '--af-warning', '--af-success', '--af-ring', '--af-radius', '--af-font-sans', '--af-font-mono',
    ]);
    expect(Object.keys(AF_DEFAULT_PALETTE.light).sort()).toEqual([...AF_TOKENS].sort());
    expect(Object.keys(AF_DEFAULT_PALETTE.dark).sort()).toEqual([...AF_TOKENS].sort());
  });

  it('maps between the address bar and the module\'s own path', () => {
    expect(modulePath('/apps/desk/t/42', '/apps/desk')).toBe('/t/42');
    expect(modulePath('/apps/desk', '/apps/desk')).toBe('/');
    expect(modulePath('/apps/desk/', '/apps/desk')).toBe('/');
    expect(modulePath('/apps/desktop', '/apps/desk')).toBe('/');
    expect(modulePath('/t/42', '/')).toBe('/t/42');
    expect(hostPath('/apps/desk', '/t/42')).toBe('/apps/desk/t/42');
    expect(hostPath('/apps/desk', 't/42')).toBe('/apps/desk/t/42');
    expect(hostPath('/apps/desk', '/')).toBe('/apps/desk/');
    expect(hostPath('/', '/t/42')).toBe('/t/42');
    expect(hostPath('/', '/')).toBe('/');
  });

  it('keeps the query and fragment both ways, and drops them outside the base path', () => {
    expect(modulePath('/apps/desk/t/42?tab=2#n', '/apps/desk')).toBe('/t/42?tab=2#n');
    expect(modulePath('/apps/desk?x=1', '/apps/desk')).toBe('/?x=1');
    expect(modulePath('/apps/desk/#n3', '/apps/desk')).toBe('/#n3');
    expect(modulePath('/apps/desk/t/42#a?b', '/apps/desk')).toBe('/t/42#a?b');
    expect(modulePath('/apps/desktop?x=1#n', '/apps/desk')).toBe('/');
    expect(modulePath('/t/42?tab=notes#n3', '/')).toBe('/t/42?tab=notes#n3');
    expect(hostPath('/apps/desk', '/t/42?tab=2#n')).toBe('/apps/desk/t/42?tab=2#n');
    expect(hostPath('/', '/?x=1')).toBe('/?x=1');
    for (const path of ['/t/42?tab=2#n', '/?x=1', '/#n3']) {
      expect(modulePath(hostPath('/apps/desk', path), '/apps/desk')).toBe(path);
    }
  });
});

describe('modules as custom elements', () => {
  it('an element mounts its module once it is connected and has a host, and unmounts when removed', () => {
    const unmount = vi.fn();
    const mount = vi.fn((root: Element) => {
      root.textContent = 'mounted';
      return unmount;
    });
    defineModuleElement('af-test-one', { mount });
    const element = document.createElement('af-test-one') as HTMLElement & { appHost?: AppHost };
    element.appHost = fakeHost();
    expect(mount).not.toHaveBeenCalled();
    document.body.append(element);
    expect(mount).toHaveBeenCalledOnce();
    expect(element.shadowRoot!.textContent).toBe('mounted');
    element.remove();
    expect(unmount).toHaveBeenCalledOnce();
  });

  it('a module made from an element renders that element with the host, and removes it on unmount', () => {
    customElements.define('af-test-two', class extends HTMLElement {});
    const root = document.createElement('div');
    const host = fakeHost();
    const stop = moduleFromElement('af-test-two').mount(root, host);
    const element = root.firstElementChild as HTMLElement & { appHost?: AppHost };
    expect(element.localName).toBe('af-test-two');
    expect(element.appHost).toBe(host);
    stop();
    expect(root.children).toHaveLength(0);
  });

  it('round-trips: a module wrapped as an element sees its own shadow root, portal root and theme', () => {
    const unmountInner = vi.fn();
    const mount = vi.fn((_root: Element, _host: AppHost) => unmountInner);
    defineModuleElement('af-test-three', { mount });
    const outer = document.createElement('div');
    document.body.append(outer);
    const host = fakeHost();
    const stop = moduleFromElement('af-test-three').mount(outer, host);
    const element = outer.firstElementChild as HTMLElement;
    expect(mount).toHaveBeenCalledOnce();
    const [root, inner] = mount.mock.calls[0]!;
    expect(root.getRootNode()).toBe(element.shadowRoot);
    expect(inner.portalRoot.getRootNode()).toBe(element.shadowRoot);
    expect(inner.portalRoot).not.toBe(host.portalRoot);
    expect(inner.context).toBe(host.context);
    expect(inner.basePath).toBe(host.basePath);
    expect(element.dataset.theme).toBe('light');
    expect(element.dataset.brand).toBe('azure');
    host.changeTheme({ mode: 'dark', brand: 'violet' });
    expect(element.dataset.theme).toBe('dark');
    expect(element.dataset.brand).toBe('violet');
    expect(host.themeListeners.size).toBe(1);
    stop();
    expect(unmountInner).toHaveBeenCalledOnce();
    expect(host.themeListeners.size).toBe(0);
    outer.remove();
  });

  it('forwards every member to a host written as a class, private fields and a cached getter included', () => {
    const paths: string[] = [];
    const locales: string[] = [];
    const mount = vi.fn((_root: Element, inner: AppHost) => {
      const channel = inner.realtime;
      if (inner.realtime !== channel) throw new Error('a second read opened another channel');
      inner.onLocationChange((path) => paths.push(path));
      inner.onLocaleChange((locale) => locales.push(locale));
      inner.navigate('/t/2?tab=notes#n3');
      return () => {};
    });
    defineModuleElement('af-test-six', { mount });
    const outer = document.createElement('div');
    document.body.append(outer);
    const host = new ClassHost();
    const stop = moduleFromElement('af-test-six').mount(outer, host);
    const element = outer.firstElementChild as HTMLElement;
    const [, inner] = mount.mock.calls[0]!;
    expect(host.opened).toBe(1);
    expect(inner.realtime).toBe(host.realtime);
    expect(host.opened).toBe(1);
    expect(paths).toEqual(['/t/1', '/t/2?tab=notes#n3']);
    host.setLocale('vi');
    expect(locales).toEqual(['vi']);
    expect(inner.context).toBe(host.context);
    expect(inner.context.locale).toBe('vi');
    expect(inner.contractVersion).toBe(2);
    expect(inner.assistant).toBe(host.assistant);
    expect(inner.assistant).toBeDefined();
    expect(inner.api).toBe(host.api);
    expect(inner.apiUrl('/attachments/a1/download')).toBe('https://agentflow.test/api/v1/attachments/a1/download');
    expect(inner.basePath).toBe('/apps/desk');
    expect(inner.portalRoot).not.toBe(host.portalRoot);
    expect(inner.portalRoot.getRootNode()).toBe(element.shadowRoot);
    stop();
    outer.remove();
  });

  it('leaves the assistant out when the host has none', () => {
    const mount = vi.fn((_root: Element, _inner: AppHost) => () => {});
    defineModuleElement('af-test-assistant-none', { mount });
    const outer = document.createElement('div');
    document.body.append(outer);
    const stop = moduleFromElement('af-test-assistant-none').mount(outer, fakeHost());
    const [, inner] = mount.mock.calls[0]!;
    expect(inner.assistant).toBeUndefined();
    stop();
    outer.remove();
  });

  it('a module made from an element throws to its caller when the wrapped module throws', () => {
    defineModuleElement('af-test-five', {
      mount: () => {
        throw new Error('boom');
      },
    });
    const root = document.createElement('div');
    document.body.append(root);
    expect(() => moduleFromElement('af-test-five').mount(root, fakeHost())).toThrow('boom');
    root.remove();
  });

  it('a module made from an undefined element throws instead of rendering nothing', () => {
    const root = document.createElement('div');
    expect(() => moduleFromElement('af-test-undefined').mount(root, fakeHost())).toThrow(
      '<af-test-undefined> is not defined',
    );
    expect(root.children).toHaveLength(0);
  });

  it('defining a tag that is already defined changes nothing', () => {
    const first: AppModule = { mount: vi.fn(() => () => {}) };
    const second: AppModule = { mount: vi.fn(() => () => {}) };
    defineModuleElement('af-test-four', first);
    defineModuleElement('af-test-four', second);
    const element = document.createElement('af-test-four') as HTMLElement & { appHost?: AppHost };
    element.appHost = fakeHost();
    document.body.append(element);
    expect(first.mount).toHaveBeenCalledOnce();
    expect(second.mount).not.toHaveBeenCalled();
    element.remove();
  });
});
