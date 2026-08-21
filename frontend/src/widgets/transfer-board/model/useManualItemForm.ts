import { startTransition, useCallback, useState } from "react";

import { itemsBatchQueue } from "@/entities/item/api/items-batch-queue";

import { getReadableError } from "../lib/getReadableError";

type AddAvailableItemLocally = (itemId: number) => void;
type ReloadAvailableItems = () => Promise<void>;

const MAX_SAFE_ID = Number.MAX_SAFE_INTEGER;

export const useManualItemForm = (
  addAvailableItemLocally: AddAvailableItemLocally,
  reloadAvailableItems: ReloadAvailableItems,
) => {
  const [manualItemId, setManualItemId] = useState("");
  const [manualItemError, setManualItemError] = useState<string | null>(null);
  const [isSubmittingManualItem, setIsSubmittingManualItem] = useState(false);

  const handleSubmitManualItem = useCallback(async () => {
    const parsedId = Number(manualItemId.trim());

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      setManualItemError("Введите положительный целый ID");
      return;
    }

    if (parsedId > MAX_SAFE_ID) {
      setManualItemError(`ID должен быть не больше ${MAX_SAFE_ID}`);
      return;
    }

    setManualItemError(null);
    setIsSubmittingManualItem(true);
    addAvailableItemLocally(parsedId);

    startTransition(() => {
      setManualItemId("");
    });

    void itemsBatchQueue.enqueueAddItem(parsedId)
      .catch(async (error) => {
        setManualItemError(getReadableError(error));
        await reloadAvailableItems();
      });

    setIsSubmittingManualItem(false);
  }, [addAvailableItemLocally, manualItemId, reloadAvailableItems]);

  return {
    manualItemId,
    manualItemError,
    isSubmittingManualItem,
    setManualItemId,
    handleSubmitManualItem,
  };
};
