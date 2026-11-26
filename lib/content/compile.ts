/**
 * Build-time content compiler. Reads /content, validates every file against
 * the content model and renders Markdown to sanitised HTML. Any invalid file
 * fails the build, so unreviewed or malformed content cannot reach a doctor.
 *
 * Runs in Node only (scripts/build-content.ts and tests), never in the app.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import YAML from "yaml";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { h } from "hastscript";
import type { Root } from "mdast";
import type { ElementContent } from "hast";
import { clinicalModules, getModuleTopics } from "@/lib/clinical/modules";
import type { Messages } from "@/lib/i18n/translate";
import {
  frontMatterSchema,
  rangeDatasetSchema,
  referenceFileSchema,
  type CompiledEntry,
  type CompiledReference,
  type ContentBundle,
  type ContentLocale,
  type RangeDataset,
} from "./schema";

export const CALLOUT_KINDS = ["guideline", "commentary", "info", "warning", "contraindication", "referral", "review"] as const;
type CalloutKind = (typeof CALLOUT_KINDS)[number];

export interface CompileOptions {
  contentDir: string;
  preview: boolean;
  messages: Record<ContentLocale, Messages>;
  /** YYYY-MM-DD, injectable for tests. */
  today?: string;
}

export interface CompileResult {
  bundle: ContentBundle;
  errors: string[];
}

const FILE_RE = /^([a-z0-9-]+)\.(uz|en|ru)\.md$/;

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "className", "dataKind"],
    a: [...(defaultSchema.attributes?.a ?? []), "href", "title"],
  },
  tagNames: [...(defaultSchema.tagNames ?? []), "aside"],
};

function readYaml(file: string): unknown {
  return YAML.parse(fs.readFileSync(file, "utf8"));
}

function zodIssues(prefix: string, error: { issues: { path: PropertyKey[]; message: string }[] }) {
  return error.issues.map((i) => `${prefix}: ${i.path.join(".") || "(root)"}: ${i.message}`);
}

function rel(contentDir: string, file: string) {
  return path.relative(path.dirname(contentDir), file).split(path.sep).join("/");
}

export function compileContent(opts: CompileOptions): CompileResult {
  const { contentDir, preview, messages } = opts;
  const today = opts.today ?? new Date().toISOString().slice(0, 10);
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Citation registry
  const references: Record<string, CompiledReference> = {};
  const refFile = path.join(contentDir, "guidelines", "references.yaml");
  if (fs.existsSync(refFile)) {
    const parsed = referenceFileSchema.safeParse(readYaml(refFile) ?? []);
    if (!parsed.success) errors.push(...zodIssues(rel(contentDir, refFile), parsed.error));
    else
      for (const ref of parsed.data) {
        if (references[ref.key]) errors.push(`${rel(contentDir, refFile)}: duplicate reference key "${ref.key}"`);
        const verified = Boolean(ref.url && ref.lastVerified);
        if (!verified) warnings.push(`reference "${ref.key}" has no official URL or verification date: shown as requiring review`);
        references[ref.key] = { ...ref, verified };
      }
  }

  // 2. Reference-range datasets
  const rangeDatasets: Record<string, RangeDataset> = {};
  const rangeDir = path.join(contentDir, "reference-ranges");
  if (fs.existsSync(rangeDir)) {
    for (const name of fs.readdirSync(rangeDir).filter((n) => n.endsWith(".yaml") && !n.startsWith("_"))) {
      const file = path.join(rangeDir, name);
      const parsed = rangeDatasetSchema.safeParse(readYaml(file));
      if (!parsed.success) {
        errors.push(...zodIssues(rel(contentDir, file), parsed.error));
        continue;
      }
      const ds = parsed.data;
      if (`${ds.id}.yaml` !== name) errors.push(`${rel(contentDir, file)}: id "${ds.id}" must match the file name`);
      if (!references[ds.source]) errors.push(`${rel(contentDir, file)}: unknown source reference "${ds.source}"`);
      if (ds.status === "approved" && (!ds.reviewedBy || !ds.reviewedAt))
        errors.push(`${rel(contentDir, file)}: approved datasets need reviewedBy and reviewedAt`);
      rangeDatasets[ds.id] = ds;
    }
  }

  // 3. Module content files
  const sections: ContentBundle["sections"] = {};
  const topics: ContentBundle["topics"] = {};
  const statusIndex: ContentBundle["statusIndex"] = {};
  const all: CompiledEntry[] = [];

  for (const m of clinicalModules) {
    const moduleDir = path.join(contentDir, "modules", m.id);
    const groups: { dir: string; kind: "section" | "topic"; allowed: string[] }[] = [
      { dir: moduleDir, kind: "section", allowed: m.sections },
      { dir: path.join(moduleDir, "topics"), kind: "topic", allowed: getModuleTopics(m) },
    ];
    for (const { dir, kind, allowed } of groups) {
      if (!fs.existsSync(dir)) continue;
      for (const name of fs.readdirSync(dir)) {
        const file = path.join(dir, name);
        if (fs.statSync(file).isDirectory() || name.startsWith("_") || name.toLowerCase() === "readme.md") continue;
        const where = rel(contentDir, file);
        const match = FILE_RE.exec(name);
        if (!match) {
          errors.push(`${where}: file names must look like <${kind}>.<uz|en|ru>.md`);
          continue;
        }
        const [, slug, locale] = match as unknown as [string, string, ContentLocale];
        if (!allowed.includes(slug)) {
          errors.push(`${where}: "${slug}" is not a ${kind} of module "${m.id}"`);
          continue;
        }
        const entry = compileFile({ file, where, kind, moduleId: m.id, slug, locale, references, rangeDatasets, messages, errors, warnings, today });
        if (!entry) continue;
        const key = `${m.id}/${slug}`;
        statusIndex[`${kind}:${key}`] = { ...statusIndex[`${kind}:${key}`], [locale]: entry.status };
        all.push(entry);
        const visible = preview || entry.status === "approved" || entry.status === "requires-review";
        if (!visible) continue;
        const target = kind === "section" ? sections : topics;
        target[key] = { ...target[key], [locale]: entry };
      }
    }
  }

  // 4. Translation drift
  for (const e of all) {
    if (e.locale === e.sourceLocale) continue;
    const source = all.find((s) => s.kind === e.kind && s.module === e.module && s.slug === e.slug && s.locale === e.sourceLocale);
    if (!source) {
      warnings.push(`${e.module}/${e.slug}.${e.locale}: source language file (${e.sourceLocale}) not found`);
    } else if (source.version !== e.sourceVersion) {
      e.translationBehind = true;
      warnings.push(`${e.module}/${e.slug}.${e.locale}: translated from ${e.sourceVersion}, original is ${source.version}`);
    }
  }

  return {
    bundle: { generatedAt: new Date().toISOString(), preview, sections, topics, statusIndex, references, rangeDatasets, warnings },
    errors,
  };
}

interface FileContext {
  file: string;
  where: string;
  kind: "section" | "topic";
  moduleId: string;
  slug: string;
  locale: ContentLocale;
  references: Record<string, CompiledReference>;
  rangeDatasets: Record<string, RangeDataset>;
  messages: Record<ContentLocale, Messages>;
  errors: string[];
  warnings: string[];
  today: string;
}

function compileFile(ctx: FileContext): CompiledEntry | null {
  const { where, locale, errors } = ctx;
  const raw = matter(fs.readFileSync(ctx.file, "utf8"));
  // gray-matter turns YAML dates into Date objects; keep them as ISO strings.
  const data = Object.fromEntries(
    Object.entries(raw.data).map(([k, v]) => [k, v instanceof Date ? v.toISOString().slice(0, 10) : v]),
  );
  const parsed = frontMatterSchema.safeParse(data);
  if (!parsed.success) {
    errors.push(...zodIssues(where, parsed.error));
    return null;
  }
  const fm = parsed.data;
  const before = errors.length;
  const translated = locale !== fm.sourceLocale;

  if (fm.status === "approved") {
    if (!fm.reviewedBy || !fm.reviewedAt) errors.push(`${where}: approved content needs reviewedBy and reviewedAt`);
    if (translated && !fm.translationVerifiedBy) errors.push(`${where}: approved translations need translationVerifiedBy`);
  }
  if (translated && !fm.sourceVersion) errors.push(`${where}: translations need sourceVersion (the original version translated)`);
  for (const key of fm.references) if (!ctx.references[key]) errors.push(`${where}: unknown reference "${key}"`);

  const cited: string[] = [];
  const html = renderMarkdown(raw.content, { ...ctx, cited });
  if (errors.length > before) return null;

  const order = [...cited, ...fm.references.filter((k) => !cited.includes(k))];
  return {
    kind: ctx.kind,
    module: ctx.moduleId,
    slug: ctx.slug,
    locale,
    title: fm.title,
    version: fm.version,
    status: fm.status,
    sourceLocale: fm.sourceLocale,
    sourceVersion: fm.sourceVersion,
    reviewedBy: fm.reviewedBy,
    reviewedAt: fm.reviewedAt,
    reviewDue: fm.reviewDue,
    overdue: Boolean(fm.reviewDue && fm.reviewDue < ctx.today),
    translationVerifiedBy: fm.translationVerifiedBy,
    translationBehind: false,
    references: order,
    html,
  };
}

function renderMarkdown(markdown: string, ctx: FileContext & { cited: string[] }): string {
  const t = ctx.messages[ctx.locale];
  const citeNumber = (key: string) => {
    if (!ctx.references[key]) {
      ctx.errors.push(`${ctx.where}: unknown reference "${key}" in citation`);
      return 0;
    }
    if (!ctx.cited.includes(key)) ctx.cited.push(key);
    return ctx.cited.indexOf(key) + 1;
  };
  const citeElements = (keys: string[]): ElementContent[] =>
    keys.map((key) => h("sup", { className: ["cite"] }, [h("a", { href: `#ref-${key}` }, `[${citeNumber(key)}]`)]));

  function directives() {
    return (tree: Root) => {
      visit(tree, (node, index, parent) => {
        if (node.type === "containerDirective") {
          if (!(CALLOUT_KINDS as readonly string[]).includes(node.name)) {
            ctx.errors.push(`${ctx.where}: unknown block ":::${node.name}". Use one of: ${CALLOUT_KINDS.join(", ")}`);
            return;
          }
          const kind = node.name as CalloutKind;
          const refs = (node.attributes?.refs ?? "").split(",").map((s) => s.trim()).filter(Boolean);
          if (kind === "guideline" && refs.length === 0)
            ctx.errors.push(`${ctx.where}: a :::guideline block must name its source, e.g. :::guideline{refs="key"}`);
          const label = h("p", { className: ["callout-label"] }, [h("span", t.content[kind]), ...citeElements(refs)]);
          node.data = { hName: "aside", hProperties: { className: ["callout", `callout-${kind}`], dataKind: kind } };
          node.children.unshift({ type: "paragraph", data: { hName: "div", hChildren: [label] }, children: [] });
          return;
        }
        if (node.type === "leafDirective") {
          if (node.name !== "range-table") {
            ctx.errors.push(`${ctx.where}: unknown block "::${node.name}". Supported: ::range-table{dataset="id"}`);
            return;
          }
          const id = node.attributes?.dataset ?? "";
          const ds = ctx.rangeDatasets[id];
          if (!ds) {
            ctx.errors.push(`${ctx.where}: unknown reference-range dataset "${id}"`);
            return;
          }
          node.data = { hName: "div", hProperties: { className: ["range-table"] }, hChildren: rangeTable(ds, ctx.locale, t, citeElements([ds.source])) };
          return;
        }
        if (node.type === "textDirective") {
          if (node.name === "cite") {
            const keys = node.children
              .map((c) => ("value" in c ? c.value : ""))
              .join("")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            node.data = { hName: "span", hChildren: citeElements(keys) };
            return;
          }
          // Not a directive we own (e.g. "ratio 1:a"): restore the original text.
          if (parent && typeof index === "number") {
            const text = node.children.map((c) => ("value" in c ? c.value : "")).join("");
            parent.children.splice(index, 1, { type: "text", value: `:${node.name}${text ? `[${text}]` : ""}` });
          }
        }
      });
    };
  }

  const file = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(directives)
    .use(remarkRehype)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
    .processSync(markdown);
  return String(file);
}

function rangeTable(ds: RangeDataset, locale: ContentLocale, t: Messages, sourceCite: ElementContent[]): ElementContent[] {
  const fmt = (n?: number) => (n === undefined ? "—" : String(n));
  const table = h("table", [
    h("caption", [`${ds.title[locale]} · ${t.content.rangeEdition}: ${ds.edition}`, ...sourceCite]),
    h("thead", [
      h("tr", [
        h("th", { scope: "col" }, t.content.rangeParameter),
        h("th", { scope: "col" }, t.content.rangeUnit),
        h("th", { scope: "col" }, t.content.rangeLower),
        h("th", { scope: "col" }, t.content.rangeUpper),
      ]),
    ]),
    h(
      "tbody",
      ds.parameters.map((p) =>
        h("tr", [
          h("th", { scope: "row" }, [p.label[locale], ...(p.note?.[locale] ? [h("br"), h("small", p.note[locale])] : [])]),
          h("td", p.unit),
          h("td", fmt(p.lowerLimit)),
          h("td", fmt(p.upperLimit)),
        ]),
      ),
    ),
  ]);
  const notice = ds.status === "approved" ? [] : [h("p", { className: ["range-warning"] }, t.content.rangeNotApproved)];
  return [...notice, h("div", { className: ["table-scroll"] }, [table])];
}
