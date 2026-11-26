import { BookOpen, Calculator, ClipboardList, FileText, FlaskConical, GitBranch, Layers, ListTree, Stethoscope, type LucideProps } from "lucide-react";
import type { SearchKind } from "@/lib/search/index";

const icons = {
  module: Layers,
  section: ListTree,
  topic: FileText,
  lab: FlaskConical,
  tool: Calculator,
  form: ClipboardList,
  algorithm: GitBranch,
  guideline: BookOpen,
  case: Stethoscope,
} satisfies Record<SearchKind, unknown>;

export function KindIcon({ kind, ...props }: { kind: SearchKind } & LucideProps) {
  const Icon = icons[kind];
  return <Icon aria-hidden="true" {...props} />;
}
