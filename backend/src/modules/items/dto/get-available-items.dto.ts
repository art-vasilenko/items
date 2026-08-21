import { z } from "zod";

import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../../../config/constants";

export const getAvailableItemsSchema = z.object({
  query: z.string().trim().default(""),
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export type GetAvailableItemsDto = z.infer<typeof getAvailableItemsSchema>;
