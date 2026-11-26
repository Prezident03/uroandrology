"use client";

import { useEffect } from "react";
import { isToolId } from "@/lib/clinical/tools";
import { useRecents, useToolUsage } from "@/lib/storage/user-prefs";

/** Records a page visit (by locale-free path) for "Recently opened" and tool usage counts. */
export function RecordRecent({ path }: { path: string }) {
  const { add } = useRecents();
  const { record } = useToolUsage();
  useEffect(() => {
    add(path);
    const tool = /^\/tools\/([a-z0-9-]+)$/.exec(path)?.[1];
    if (tool && isToolId(tool)) record(tool);
  }, [add, record, path]);
  return null;
}
