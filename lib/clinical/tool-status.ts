import "server-only";
import { getAlgorithm, getInterpretation, getQuestionnaire, listRangeDatasets } from "@/lib/content";
import type { ContentStatusValue } from "@/lib/content/schema";
import type { ToolId } from "./tools";

/** Status of the reviewed data a tool depends on: undefined = data not added yet. */
export function toolDataStatus(id: ToolId): ContentStatusValue | "none-needed" | undefined {
  switch (id) {
    case "iief-5":
    case "pedt":
      return getQuestionnaire(id)?.status;
    case "bmi":
      return getInterpretation("bmi")?.status ?? "none-needed";
    case "semen-analysis":
      return listRangeDatasets("semen")[0]?.status;
    case "hormonal-assessment":
      return "none-needed";
    case "testosterone-pathway":
      return getAlgorithm("hypogonadism")?.status;
    case "reference-ranges":
      return listRangeDatasets()[0]?.status;
  }
}

