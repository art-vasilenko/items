import { useCallback } from "react";

import { useAvailableItems } from "./useAvailableItems";
import { useManualItemForm } from "./useManualItemForm";
import { useReorderSelectedItems } from "./useReorderSelectedItems";
import { useSelectedItems } from "./useSelectedItems";
import { useSelectionActions } from "./useSelectionActions";

export const useTransferBoard = () => {
  const availableItemsModel = useAvailableItems();
  const selectedItemsModel = useSelectedItems();
  const addAvailableItemLocally = useCallback(
    (itemId: number) => availableItemsModel.addItemLocally({ id: itemId }),
    [availableItemsModel],
  );
  const addSelectedItemLocally = useCallback(
    (itemId: number) => selectedItemsModel.addItemLocally({ id: itemId }),
    [selectedItemsModel],
  );

  const reloadLists = useCallback(async () => {
    await Promise.all([availableItemsModel.reload(), selectedItemsModel.reload()]);
  }, [availableItemsModel, selectedItemsModel]);

  const selectionActionsModel = useSelectionActions({
    addAvailableItemLocally,
    addSelectedItemLocally,
    removeAvailableItemLocally: availableItemsModel.removeItemLocally,
    removeSelectedItemLocally: selectedItemsModel.removeItemLocally,
    reloadVisibleLists: reloadLists,
  });

  const manualItemFormModel = useManualItemForm(
    addAvailableItemLocally,
    availableItemsModel.reload,
  );

  const reorderSelectedItemsModel = useReorderSelectedItems({
    reloadSelectedItems: selectedItemsModel.reload,
    reorderItemsLocally: selectedItemsModel.reorderItemsLocally,
    getVisibleItemIds: () => selectedItemsModel.itemIds,
  });

  return {
    availableFilter: availableItemsModel.filter,
    selectedFilter: selectedItemsModel.filter,
    manualItemId: manualItemFormModel.manualItemId,
    manualItemError: manualItemFormModel.manualItemError,
    isSubmittingManualItem: manualItemFormModel.isSubmittingManualItem,
    isMutatingSelection: selectionActionsModel.isMutatingSelection,
    isReorderingSelected: reorderSelectedItemsModel.isReorderingSelected,
    availableState: availableItemsModel.state,
    selectedState: selectedItemsModel.state,
    availableItems: availableItemsModel.items,
    selectedItems: selectedItemsModel.items,
    setAvailableFilter: availableItemsModel.setFilter,
    setSelectedFilter: selectedItemsModel.setFilter,
    setManualItemId: manualItemFormModel.setManualItemId,
    handleSelectItem: selectionActionsModel.handleSelectItem,
    handleUnselectItem: selectionActionsModel.handleUnselectItem,
    handleSubmitManualItem: manualItemFormModel.handleSubmitManualItem,
    handleReorderSelected: reorderSelectedItemsModel.handleReorderSelected,
    loadMoreAvailable: availableItemsModel.loadMore,
    loadMoreSelected: selectedItemsModel.loadMore,
  };
};
