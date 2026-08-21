import { useCallback, useState } from "react";

import { itemsBatchQueue } from "@/entities/item/api/items-batch-queue";

import { reorderArray } from "../lib/reorderArray";

type UseReorderSelectedItemsParams = {
  reloadSelectedItems: () => Promise<void>;
  reorderItemsLocally: (activeId: number, overId: number) => void;
  getVisibleItemIds: () => number[];
};

export const useReorderSelectedItems = ({
  reloadSelectedItems,
  reorderItemsLocally,
  getVisibleItemIds,
}: UseReorderSelectedItemsParams) => {
  const [isReorderingSelected, setIsReorderingSelected] = useState(false);

  const handleReorderSelected = useCallback(
    (activeId: number, overId: number) => {
      if (activeId === overId) {
        return Promise.resolve();
      }

      setIsReorderingSelected(true);

      const reorderedVisibleIds = reorderArray(getVisibleItemIds(), activeId, overId);
      reorderItemsLocally(activeId, overId);

      const queuedReorder = itemsBatchQueue.enqueueReorder(reorderedVisibleIds)
        .catch(async () => {
          await reloadSelectedItems();
        });

      setIsReorderingSelected(false);

      return queuedReorder;
    },
    [getVisibleItemIds, reloadSelectedItems, reorderItemsLocally],
  );

  return {
    isReorderingSelected,
    handleReorderSelected,
  };
};
