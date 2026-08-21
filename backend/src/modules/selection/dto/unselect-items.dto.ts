import { z } from "zod";

export const unselectItemsSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1),
});

export type UnselectItemsDto = z.infer<typeof unselectItemsSchema>;
