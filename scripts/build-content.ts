/**
 * Compiles /content into .content/bundle.json and fails on any invalid file.
 *   pnpm content            production rules (drafts hidden)
 *   pnpm content --preview  include drafts and in-review content
 * Preview is also on when CONTENT_PREVIEW=true or on Vercel preview deployments.
 */
import fs from "node:fs";
import path from "node:path";
import { compileContent } from "@/lib/content/compile";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";
import uz from "@/messages/uz.json";

const root = path.resolve(import.meta.dirname, "..");
const preview =
  process.argv.includes("--preview") ||
  process.env.CONTENT_PREVIEW === "true" ||
  process.env.VERCEL_ENV === "preview";

const { bundle, errors } = compileContent({
  contentDir: path.join(root, "content"),
  preview,
  messages: { uz, en, ru },
});

for (const w of bundle.warnings) console.warn(`content warning: ${w}`);
if (errors.length > 0) {
  console.error(`\n${errors.length} content error(s):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}

const outDir = path.join(root, ".content");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "bundle.json"), JSON.stringify(bundle));
const count = (o: Record<string, object>) => Object.values(o).reduce((n, v) => n + Object.keys(v).length, 0);
console.log(
  `content: ${count(bundle.sections)} section file(s), ${count(bundle.topics)} topic file(s), ` +
    `${Object.keys(bundle.references).length} reference(s), ${Object.keys(bundle.rangeDatasets).length} range dataset(s)` +
    (preview ? " [preview: drafts included]" : ""),
);
