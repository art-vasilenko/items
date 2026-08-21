import type { ItemId } from "../../shared/types/common.types";

export const deduplicateIds = (ids: ItemId[]) => {
  return [...new Set(ids)];
};
