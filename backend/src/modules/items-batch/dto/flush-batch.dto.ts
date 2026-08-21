import { z } from "zod";

import { MAX_SAFE_ID } from "../../../config/constants";

export const flushBatchSchema = z.object({
  commands: z.array(
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("add-items"),
        ids: z.array(z.number().int().positive().max(MAX_SAFE_ID)).min(1),
      }),
      z.object({
        type: z.literal("select-items"),
        ids: z.array(z.number().int().positive().max(MAX_SAFE_ID)).min(1),
      }),
      z.object({
        type: z.literal("unselect-items"),
        ids: z.array(z.number().int().positive().max(MAX_SAFE_ID)).min(1),
      }),
      z.object({
        type: z.literal("reorder-selected"),
        activeId: z.number().int().positive().max(MAX_SAFE_ID).optional(),
        overId: z.number().int().positive().max(MAX_SAFE_ID).optional(),
        orderedIds: z.array(z.number().int().positive().max(MAX_SAFE_ID)).min(1).optional(),
      }),
    ]).refine(
      (value) => value.type !== "reorder-selected"
        || Array.isArray(value.orderedIds)
        || (typeof value.activeId === "number" && typeof value.overId === "number"),
      {
        message: "Reorder command requires orderedIds or activeId/overId",
      },
    ),
  ).min(1),
});

export type FlushBatchDto = z.infer<typeof flushBatchSchema>;
