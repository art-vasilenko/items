import { useCallback, useState } from "react";

import { itemsBatchQueue } from "@/entities/item/api/items-batch-queue";

type UseSelectionActionsParams = {
  addAvailableItemLocally: (itemId: number) => void;
  addSelectedItemLocally: (itemId: number) => void;
  removeAvailableItemLocally: (itemId: number) => void;
  removeSelectedItemLocally: (itemId: number) => void;
  reloadVisibleLists: () => Promise<void>;
};

export const useSelectionActions = ({
  addAvailableItemLocally,
  addSelectedItemLocally,
  removeAvailableItemLocally,
  removeSelectedItemLocally,
  reloadVisibleLists,
}: UseSelectionActionsParams) => {
  const [isMutatingSelection, setIsMutatingSelection] = useState(false);

  const runSelectionMutation = useCallback((
    itemId: number,
    operation: "select" | "unselect",
    applyLocally: (id: number) => void,
  ) => {
    setIsMutatingSelection(true);
    applyLocally(itemId);

    const queuedMutation = itemsBatchQueue.enqueueSelection(itemId, operation)
      .catch(async () => {
        await reloadVisibleLists();
      });

    setIsMutatingSelection(false);

    return queuedMutation;
  }, [reloadVisibleLists]);

  const handleSelectItem = useCallback(
    async (itemId: number) => runSelectionMutation(itemId, "select", (id) => {
      removeAvailableItemLocally(id);
      addSelectedItemLocally(id);
    }),
    [addSelectedItemLocally, removeAvailableItemLocally, runSelectionMutation],
  );

  const handleUnselectItem = useCallback(
    async (itemId: number) => runSelectionMutation(itemId, "unselect", (id) => {
      removeSelectedItemLocally(id);
      addAvailableItemLocally(id);
    }),
    [addAvailableItemLocally, removeSelectedItemLocally, runSelectionMutation],
  );

  return {
    isMutatingSelection,
    handleSelectItem,
    handleUnselectItem,
  };
};
