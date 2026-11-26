/**
 * Renders compiled content HTML. The HTML is produced at build time from
 * repository files and sanitised by rehype-sanitize (lib/content/compile.ts).
 */
export function ContentBody({ html }: { html: string }) {
  return <div className="clinical-prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
