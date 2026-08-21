import { useTransferBoardView } from "@/widgets/transfer-board/model/useTransferBoardView";

import { AvailableItemsColumn } from "./AvailableItemsColumn";
import { SelectedItemsColumn } from "./SelectedItemsColumn";
import { TransferBoardHeader } from "./TransferBoardHeader";
import styles from "./TransferBoardWidget.module.css";

export const TransferBoardWidget = () => {
  const {
    availableFilter,
    selectedFilter,
    manualItemId,
    manualItemError,
    isSubmittingManualItem,
    isMutatingSelection,
    isReorderingSelected,
    availableState,
    selectedState,
    availableItems,
    selectedItems,
    setAvailableFilter,
    setSelectedFilter,
    setManualItemId,
    handleSelectItem,
    handleUnselectItem,
    handleSubmitManualItem,
    loadMoreAvailable,
    loadMoreSelected,
    selectedSortableIds,
    sensors,
    handleSelectedDragEnd,
  } = useTransferBoardView();

  return (
    <section className={styles.shell}>
      <TransferBoardHeader
        availableCount={availableState.items.length}
        selectedCount={selectedState.items.length}
      />

      <div className={styles.grid}>
        <AvailableItemsColumn
          filter={availableFilter}
          manualItemId={manualItemId}
          manualItemError={manualItemError}
          isSubmittingManualItem={isSubmittingManualItem}
          isMutatingSelection={isMutatingSelection}
          state={availableState}
          items={availableItems}
          onFilterChange={setAvailableFilter}
          onManualItemChange={setManualItemId}
          onSelectItem={handleSelectItem}
          onSubmitManualItem={handleSubmitManualItem}
          onLoadMore={loadMoreAvailable}
        />

        <SelectedItemsColumn
          filter={selectedFilter}
          isSelectionBusy={isMutatingSelection || isReorderingSelected}
          state={selectedState}
          items={selectedItems}
          sortableIds={selectedSortableIds}
          sensors={sensors}
          onFilterChange={setSelectedFilter}
          onUnselectItem={handleUnselectItem}
          onLoadMore={loadMoreSelected}
          onDragEnd={handleSelectedDragEnd}
        />
      </div>
    </section>
  );
};
