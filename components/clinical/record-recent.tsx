"use client";

import { useEffect } from "react";
import { useRecents } from "@/lib/storage/user-prefs";
import type { ModuleId } from "@/types/clinical/module";

/** Records a module visit for the dashboard's "Recently opened" list. */
export function RecordRecent({ moduleId }: { moduleId: ModuleId }) {
  const { add } = useRecents();
  useEffect(() => {
    add(moduleId);
  }, [add, moduleId]);
  return null;
}
