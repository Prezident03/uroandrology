import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import uz from "@/messages/uz.json";
import { createTranslator } from "@/lib/i18n/translate";
import { buildSearchIndex, findByPath, searchEntries, suggestedPaths } from "@/lib/search/index";
import { isSitePath } from "@/lib/storage/user-prefs";

const index = buildSearchIndex(createTranslator(en), [
  { kind: "guideline", id: "library", title: "Guidelines library", path: "/guidelines" },
  { kind: "algorithm", id: "male-infertility", title: "Male infertility pathway", path: "/algorithms/male-infertility" },
]);

describe("search index", () => {
  it("covers every category", () => {
    const kinds = new Set(index.map((e) => e.kind));
    for (const k of ["module", "section", "topic", "lab", "tool", "form", "algorithm", "guideline"]) expect(kinds.has(k as never)).toBe(true);
  });

  it("classifies semen and hormone topics as lab parameters", () => {
    expect(findByPath(index, "/modules/hypogonadism/topics/total-testosterone")?.kind).toBe("lab");
    expect(index.filter((e) => e.kind === "lab").length).toBeGreaterThan(10);
  });

  it("uses unique, locale-free paths that are valid bookmark keys", () => {
    const paths = index.map((e) => e.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const p of paths) expect(isSitePath(p)).toBe(true);
  });

  it("ranks title prefix matches first and requires every term", () => {
    const r = searchEntries(index, "bmi");
    expect(r[0].path).toBe("/tools/bmi");
    expect(searchEntries(index, "bmi zzzz")).toHaveLength(0);
    expect(searchEntries(index, "   ")).toHaveLength(0);
  });

  it("resolves the default suggestions", () => {
    for (const p of suggestedPaths) expect(findByPath(index, p)).toBeDefined();
  });

  it("builds in Uzbek too", () => {
    const uzIndex = buildSearchIndex(createTranslator(uz));
    expect(uzIndex.length).toBe(index.length - 2);
  });
});

describe("bookmark path validation", () => {
  it("accepts site paths and rejects anything else", () => {
    expect(isSitePath("/tools/bmi")).toBe(true);
    expect(isSitePath("tools/bmi")).toBe(false);
    expect(isSitePath("/tools/<script>")).toBe(false);
    expect(isSitePath("/patient/John Smith")).toBe(false);
    expect(isSitePath(42)).toBe(false);
  });
});
