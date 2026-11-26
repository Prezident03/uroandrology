import { ClipboardList, FlaskConical, HeartPulse, Microscope, Timer, type LucideProps } from "lucide-react";
import type { ModuleIcon as ModuleIconName } from "@/types/clinical/module";

const icons = {
  microscope: Microscope,
  "heart-pulse": HeartPulse,
  timer: Timer,
  flask: FlaskConical,
  clipboard: ClipboardList,
} satisfies Record<ModuleIconName, unknown>;

export function ModuleIcon({ name, ...props }: { name: ModuleIconName } & LucideProps) {
  const Icon = icons[name];
  return <Icon aria-hidden="true" {...props} />;
}
