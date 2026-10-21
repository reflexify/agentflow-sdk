declare module '*.svelte' {
  const component: { element: CustomElementConstructor };
  export default component;
}

declare module '*.css?inline' {
  const css: string;
  export default css;
}
