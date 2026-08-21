import { z } from "zod";

import { MAX_SAFE_ID } from "../../../config/constants";

export const selectItemsSchema = z.object({
  ids: z.array(z.number().int().positive().max(MAX_SAFE_ID)).min(1),
});

export type SelectItemsDto = z.infer<typeof selectItemsSchema>;
