// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HOA, MINH, PEOPLE } from '../src/api/seed.js';
import { TEXT } from '../src/text.js';
import { stubColorScheme } from './support/media.js';

const PAGE = `
  <div class="demo-bar" id="demo-bar" hidden>
    <nav class="demo-nav">
      <a href="/?demo" data-nav="mywork"></a>
      <a href="/projects?demo" data-nav="projects"></a>
    </nav>
    <label><span id="persona-label"></span> <select id="persona"></select></label>
  </div>
  <div id="root"></div>`;

beforeEach(() => {
  vi.resetModules();
  document.body.innerHTML = PAGE;
  stubColorScheme(false);
});
afterEach(() => {
  window.__projects?.unmount();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  history.replaceState(null, '', '/');
});

/** Everything the page shows is in its container's shadow root, beside the stylesheet. */
const shown = () => document.getElementById('root')!.shadowRoot?.querySelector<HTMLElement>('[data-af-root]') ?? null;
const projectCount = () => shown()?.querySelector('[data-part="project-count"]')?.textContent ?? null;
const nav = (place: 'mywork' | 'projects') => document.querySelector<HTMLAnchorElement>(`a[data-nav="${place}"]`)!;
const persona = () => document.getElementById('persona') as HTMLSelectElement;

describe('the demo page', () => {
  it('mounts Projects on the in-memory AgentFlow in the root\'s shadow root, and My Work shows', async () => {
    history.replaceState(null, '', '/?demo');
    const fetchMock = vi.fn(async () => Promise.reject(new TypeError('no server')));
    vi.stubGlobal('fetch', fetchMock);
    await import('../src/main.js');
    await vi.waitFor(() => expect(projectCount()).toBe(TEXT.en.myWorkProjectCount.replace('{n}', '2')));
    expect(shown()!.querySelector('.projects')).not.toBeNull();
    expect(document.getElementById('root')!.shadowRoot!.querySelector('style')?.textContent).toContain('.projects');
    expect(document.getElementById('root')!.dataset.theme).toBe('light');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('mounts the demo without ?demo in a build made for it', async () => {
    vi.stubEnv('VITE_PROJECTS_DEMO', '1');
    const fetchMock = vi.fn(async () => Promise.reject(new TypeError('no server')));
    vi.stubGlobal('fetch', fetchMock);
    await import('../src/main.js');
    await vi.waitFor(() => expect(projectCount()).toBe(TEXT.en.myWorkProjectCount.replace('{n}', '2')));
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });

  it('lists the six people above the module, outside its shadow root, with Minh chosen', async () => {
    history.replaceState(null, '', '/?demo');
    await import('../src/main.js');
    await vi.waitFor(() => expect(projectCount()).not.toBeNull());
    expect(document.getElementById('demo-bar')!.hidden).toBe(false);
    expect(document.getElementById('persona-label')!.textContent).toBe(TEXT.en.demoViewingAs);
    expect([...persona().options].map((o) => [o.value, o.textContent])).toEqual(PEOPLE.map((p) => [p.id, p.name]));
    expect(persona().value).toBe(MINH);
  });

  it('switches person through window.__projects.actAs, remounting My Work as that person', async () => {
    history.replaceState(null, '', '/?demo');
    await import('../src/main.js');
    await vi.waitFor(() => expect(projectCount()).toBe(TEXT.en.myWorkProjectCount.replace('{n}', '2')));
    const before = shown()!.querySelector('.projects');
    window.__projects!.actAs(HOA);
    // Minh holds two unfinished tasks; Hoa five, and a sixth frozen in the closed project, which My Work leaves out.
    await vi.waitFor(() => expect(projectCount()).toBe(TEXT.en.myWorkProjectCount.replace('{n}', '5')));
    expect(shown()!.querySelector('.projects')).not.toBe(before);
    expect(shown()!.querySelectorAll('.projects')).toHaveLength(1);
    expect(persona().value).toBe(HOA);
  });

  it('switches person from the page\'s own select', async () => {
    history.replaceState(null, '', '/?demo');
    await import('../src/main.js');
    await vi.waitFor(() => expect(projectCount()).not.toBeNull());
    persona().value = HOA;
    persona().dispatchEvent(new Event('change', { bubbles: true }));
    await vi.waitFor(() => expect(projectCount()).toBe(TEXT.en.myWorkProjectCount.replace('{n}', '5')));
  });

  it('links to My Work and to the project list from the bar, in the browser\'s language', async () => {
    history.replaceState(null, '', '/?demo');
    await import('../src/main.js');
    await vi.waitFor(() => expect(projectCount()).not.toBeNull());
    expect(nav('mywork').textContent).toBe(TEXT.en.myWork);
    expect(nav('projects').textContent).toBe(TEXT.en.breadcrumbProjects);
    expect(nav('mywork').getAttribute('aria-current')).toBe('page');
    expect(nav('projects').hasAttribute('aria-current')).toBe(false);
    expect(document.getElementById('demo-bar')!.contains(nav('mywork'))).toBe(true);
    expect(document.getElementById('root')!.shadowRoot!.contains(nav('mywork'))).toBe(false);
  });

  it('speaks Vietnamese on the links when the browser does', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('vi-VN');
    history.replaceState(null, '', '/?demo');
    await import('../src/main.js');
    await vi.waitFor(() => expect(projectCount()).not.toBeNull());
    expect(nav('mywork').textContent).toBe('Việc của tôi');
    expect(nav('projects').textContent).toBe('Dự án');
  });

  it('shows the project list on a click of Dự án, without a reload, and keeps ?demo', async () => {
    history.replaceState(null, '', '/?demo');
    await import('../src/main.js');
    await vi.waitFor(() => expect(projectCount()).not.toBeNull());
    const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    nav('projects').dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    await vi.waitFor(() => expect(shown()!.querySelector('.project-grid')).not.toBeNull());
    expect(location.pathname + location.search).toBe('/projects?demo');
    expect(nav('projects').getAttribute('aria-current')).toBe('page');
    expect(nav('mywork').hasAttribute('aria-current')).toBe(false);
    expect(shown()!.querySelectorAll('.projects')).toHaveLength(1);
    nav('mywork').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
    await vi.waitFor(() => expect(projectCount()).not.toBeNull());
    expect(location.pathname + location.search).toBe('/?demo');
    expect(nav('mywork').getAttribute('aria-current')).toBe('page');
  });

  it('leaves a modified click to the browser', async () => {
    history.replaceState(null, '', '/?demo');
    await import('../src/main.js');
    await vi.waitFor(() => expect(projectCount()).not.toBeNull());
    const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ctrlKey: true });
    nav('projects').dispatchEvent(click);
    expect(click.defaultPrevented).toBe(false);
    expect(location.pathname).toBe('/');
  });

  it('follows the module from My Work into a project by the task drawer\'s project link, and back in history', async () => {
    history.replaceState(null, '', '/?demo');
    await import('../src/main.js');
    await vi.waitFor(() => expect(shown()!.querySelector('.card-title')).not.toBeNull());
    expect(nav('mywork').getAttribute('aria-current')).toBe('page');
    shown()!.querySelector<HTMLElement>('.card-title')!.click();
    await vi.waitFor(() => expect(shown()!.querySelector('a.drawer-crumb-link')).not.toBeNull());
    // Opening the drawer moves the address but not the screen: My Work is still the current link.
    expect(nav('mywork').getAttribute('aria-current')).toBe('page');
    shown()!.querySelector<HTMLElement>('a.drawer-crumb-link')!.click();
    await vi.waitFor(() => expect(location.pathname).toMatch(/^\/p\/[^/]+$/));
    expect(nav('projects').getAttribute('aria-current')).toBe('page');
    expect(nav('mywork').hasAttribute('aria-current')).toBe(false);
    history.go(-2);
    await vi.waitFor(() => expect(location.pathname).toBe('/'));
    await vi.waitFor(() => expect(nav('mywork').getAttribute('aria-current')).toBe('page'));
    expect(nav('projects').hasAttribute('aria-current')).toBe(false);
  });

  it('keeps the current link when the person changes', async () => {
    history.replaceState(null, '', '/projects?demo');
    await import('../src/main.js');
    await vi.waitFor(() => expect(shown()!.querySelector('.project-card')).not.toBeNull());
    window.__projects!.actAs(HOA);
    await vi.waitFor(() => expect(shown()!.querySelector('.project-card')).not.toBeNull());
    expect(nav('projects').getAttribute('aria-current')).toBe('page');
    expect(nav('mywork').hasAttribute('aria-current')).toBe(false);
  });
});
