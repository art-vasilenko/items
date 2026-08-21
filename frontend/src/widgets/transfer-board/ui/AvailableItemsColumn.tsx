import { memo } from "react";

import { ItemCard } from "@/entities/item";
import { AddManualItemForm } from "@/features/add-manual-item";
import { FilterItemsField } from "@/features/filter-items";
import { BoardColumn } from "@/shared/ui/BoardColumn/BoardColumn";
import { SectionCard } from "@/shared/ui/SectionCard/SectionCard";
import { VirtualList } from "@/shared/ui/VirtualList/VirtualList";

import type { AvailableItemsColumnProps } from "./types";
import styles from "./TransferBoardWidget.module.css";

export const AvailableItemsColumn = memo(({
  filter,
  manualItemId,
  manualItemError,
  isSubmittingManualItem,
  isMutatingSelection,
  state,
  items,
  onFilterChange,
  onManualItemChange,
  onSelectItem,
  onSubmitManualItem,
  onLoadMore,
}: AvailableItemsColumnProps) => {
  return (
    <SectionCard>
      <BoardColumn
        title="Доступные элементы"
        subtitle="Левое окно"
        note="Фильтрация, подгрузка порциями при скролле и добавление новых ID."
        actions={(
          <>
            <FilterItemsField
              placeholder="Например, 12 или 1000001"
              value={filter}
              onChange={onFilterChange}
            />
            <AddManualItemForm
              value={manualItemId}
              error={manualItemError}
              isSubmitting={isSubmittingManualItem}
              onChange={onManualItemChange}
              onSubmit={onSubmitManualItem}
            />
          </>
        )}
      >
        {state.error ? (
          <p className={styles.errorMessage}>{state.error}</p>
        ) : null}

        {state.isLoading && items.length === 0 ? (
          <p className={styles.infoMessage}>Загружаем доступные элементы...</p>
        ) : null}

        {!state.isLoading && items.length === 0 ? (
          <p className={styles.infoMessage}>По текущему фильтру ничего не найдено.</p>
        ) : null}

        <VirtualList
          items={items}
          estimateItemHeight={88}
          className={styles.listViewport}
          canLoadMore={state.hasMore}
          isLoadingMore={state.isLoadingMore}
          onLoadMore={() => void onLoadMore()}
          renderItem={(item) => (
            <ItemCard
              key={item.id}
              id={item.id}
              tone={item.tone}
              actionLabel="Выбрать"
              onAction={() => void onSelectItem(item.id)}
              actionDisabled={isMutatingSelection}
            />
          )}
        />

        {state.isLoadingMore ? (
          <p className={styles.loadingMoreMessage}>Подгружаем следующую порцию...</p>
        ) : null}
      </BoardColumn>
    </SectionCard>
  );
});
