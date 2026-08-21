import { z } from "zod";

import { MAX_SAFE_ID } from "../../../config/constants";

export const reorderSelectedSchema = z.object({
  activeId: z.number().int().positive().max(MAX_SAFE_ID).optional(),
  overId: z.number().int().positive().max(MAX_SAFE_ID).optional(),
  orderedIds: z.array(z.number().int().positive().max(MAX_SAFE_ID)).min(1).optional(),
}).refine(
  (value) =>
    Array.isArray(value.orderedIds)
    || (typeof value.activeId === "number" && typeof value.overId === "number"),
  {
    message: "Either orderedIds or activeId/overId is required",
  },
).refine(
  (value) => !(Array.isArray(value.orderedIds) && (value.activeId !== undefined || value.overId !== undefined)),
  {
    message: "Use either orderedIds or activeId/overId",
  },
);

export type ReorderSelectedDto = z.infer<typeof reorderSelectedSchema>;
