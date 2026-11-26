import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { compileContent } from "@/lib/content/compile";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";
import uz from "@/messages/uz.json";

const fixtures = path.join(import.meta.dirname, "fixtures", "content");
const messages = { uz, en, ru };
const compile = (contentDir: string, preview = false) =>
  compileContent({ contentDir, preview, messages, today: "2026-06-01" });

/** Copies the fixture tree and lets a test add or overwrite files. */
function withFiles(files: Record<string, string>) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ua-content-"));
  fs.cpSync(fixtures, dir, { recursive: true });
  for (const [name, body] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.writeFileSync(path.join(dir, name), body);
  }
  return dir;
}

describe("content compiler", () => {
  it("compiles valid fixtures without errors", () => {
    const { errors } = compile(fixtures);
    expect(errors).toEqual([]);
  });

  it("renders callouts, citations and range tables, and strips scripts", () => {
    const entry = compile(fixtures).bundle.sections["male-infertility/epidemiology"]?.en;
    expect(entry).toBeDefined();
    const html = entry!.html;
    expect(html).toContain('class="callout callout-guideline"');
    expect(html).toContain('class="callout callout-commentary"');
    expect(html).toContain('href="#ref-test-guideline"');
    expect(html).toContain("<table>");
    expect(html).toContain("Ratio 1:a stays text.");
    expect(html).not.toContain("<script");
    expect(entry!.references).toEqual(["test-guideline", "test-unverified"]);
  });

  it("flags overdue reviews and translations behind the original", () => {
    const { bundle } = compile(fixtures);
    expect(bundle.sections["male-infertility/epidemiology"]?.en?.overdue).toBe(true);
    expect(bundle.sections["male-infertility/epidemiology"]?.uz?.translationBehind).toBe(true);
  });

  it("marks references without URL or verification date as unverified", () => {
    const { bundle } = compile(fixtures);
    expect(bundle.references["test-guideline"]?.verified).toBe(true);
    expect(bundle.references["test-unverified"]?.verified).toBe(false);
  });

  it("hides drafts in production but keeps them in the status index", () => {
    const prod = compile(fixtures).bundle;
    expect(prod.sections["male-infertility/etiology"]).toBeUndefined();
    expect(prod.statusIndex["section:male-infertility/etiology"]?.en).toBe("draft");
    expect(prod.topics["male-infertility/azoospermia"]?.en?.status).toBe("requires-review");
    const preview = compile(fixtures, true).bundle;
    expect(preview.sections["male-infertility/etiology"]?.en?.status).toBe("draft");
  });

  it("compiles clinical cases with self-assessment questions", () => {
    const entry = compile(fixtures).bundle.cases["test-case"]?.en;
    expect(entry?.module).toBe("male-infertility");
    expect(entry?.caseMeta?.questions[0]?.answer).toBe(1);
  });

  it.each([
    ["case without anonymisation", "../cases/bad.en.md", "---\ntitle: Bad case\nversion: 1.0.0\nstatus: draft\nsourceLocale: en\nmodule: hypogonadism\n---\nx", "anonymisation"],
    ["case answer out of range", "../cases/bad.en.md", "---\ntitle: Bad case\nversion: 1.0.0\nstatus: draft\nsourceLocale: en\nmodule: hypogonadism\nanonymisation: fictional\nquestions:\n  - question: Qq?\n    options: [A, B]\n    answer: 5\n    explanation: Eee\n---\nx", "answer must be the index"],
    ["approved without reviewer", "male-infertility/treatment.en.md", "---\nversion: 1.0.0\nstatus: approved\nsourceLocale: en\n---\nx", "reviewedBy"],
    ["unknown reference", "male-infertility/treatment.en.md", "---\nversion: 1.0.0\nstatus: draft\nsourceLocale: en\n---\n:cite[nope]", 'unknown reference "nope"'],
    ["guideline without source", "male-infertility/treatment.en.md", "---\nversion: 1.0.0\nstatus: draft\nsourceLocale: en\n---\n:::guideline\nx\n:::", "must name its source"],
    ["unknown section", "male-infertility/not-a-section.en.md", "---\nversion: 1.0.0\nstatus: draft\nsourceLocale: en\n---\nx", "is not a section"],
    ["bad file name", "male-infertility/treatment.de.md", "---\nversion: 1.0.0\nstatus: draft\nsourceLocale: en\n---\nx", "file names must look like"],
    ["translation without sourceVersion", "male-infertility/treatment.ru.md", "---\nversion: 1.0.0\nstatus: draft\nsourceLocale: en\n---\nx", "sourceVersion"],
    ["unknown block", "male-infertility/treatment.en.md", "---\nversion: 1.0.0\nstatus: draft\nsourceLocale: en\n---\n:::tip\nx\n:::", 'unknown block ":::tip"'],
    ["unknown field", "male-infertility/treatment.en.md", "---\nversion: 1.0.0\nstatus: draft\nsourceLocale: en\nauthor: x\n---\nx", "author"],
  ])("rejects %s", (_, file, body, message) => {
    const { errors } = compile(withFiles({ [`modules/${file}`]: body }));
    expect(errors.join("\n")).toContain(message);
  });
});
