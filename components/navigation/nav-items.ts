import { BookOpen, Calculator, ClipboardList, GitBranch, Layers, LayoutDashboard, Settings, ShieldCheck, Stethoscope, type LucideIcon } from "lucide-react";
import type { MessageKey } from "@/lib/i18n/translate";

export interface NavItem {
  labelKey: MessageKey;
  icon: LucideIcon;
  /** Path after the locale prefix. Omitted while the section is not built yet. */
  path?: string;
  /** Roadmap phase that delivers this section (shown as "Soon"). */
  plannedPhase?: number;
}

export const primaryNav: NavItem[] = [
  { labelKey: "nav.dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { labelKey: "nav.modules", icon: Layers, path: "/modules" },
  { labelKey: "nav.assessment", icon: ClipboardList, path: "/assessment" },
  { labelKey: "nav.tools", icon: Calculator, path: "/tools" },
  { labelKey: "nav.algorithms", icon: GitBranch, path: "/algorithms" },
  { labelKey: "nav.guidelines", icon: BookOpen, path: "/guidelines" },
  { labelKey: "nav.cases", icon: Stethoscope, path: "/clinical-cases" },
];

export const secondaryNav: NavItem[] = [
  { labelKey: "nav.contentStatus", icon: ShieldCheck, path: "/content-status" },
  { labelKey: "nav.settings", icon: Settings, path: "/settings" },
];

export function isActivePath(pathname: string, locale: string, path: string) {
  const full = `/${locale}${path}`;
  return pathname === full || pathname.startsWith(`${full}/`);
}
