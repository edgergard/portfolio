/** `?raw` imports: tests read source files (styles.css, svg, ts) as text through Vitest. */
declare module '*?raw' {
  const content: string;

  export default content;
}
