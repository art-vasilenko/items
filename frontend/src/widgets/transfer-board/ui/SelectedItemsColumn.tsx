import { memo } from "react";

import { FilterItemsField } from "@/features/filter-items";
import { BoardColumn } from "@/shared/ui/BoardColumn/BoardColumn";
import { SectionCard } from "@/shared/ui/SectionCard/SectionCard";

import { SortableSelectedList } from "./SortableSelectedList";
import type { SelectedItemsColumnProps } from "./types";
import styles from "./TransferBoardWidget.module.css";

export const SelectedItemsColumn = memo(({
  filter,
  isSelectionBusy,
  state,
  items,
  sortableIds,
  sensors,
  onFilterChange,
  onUnselectItem,
  onLoadMore,
  onDragEnd,
}: SelectedItemsColumnProps) => {
  return (
    <SectionCard emphasized>
      <BoardColumn
        title="Выбранные элементы"
        subtitle="Правое окно"
        note="Drag-and-drop корректно работает и для отфильтрованного списка."
        actions={(
          <FilterItemsField
            placeholder="Фильтр по выбранным ID"
            value={filter}
            onChange={onFilterChange}
          />
        )}
      >
        {state.error ? (
          <p className={styles.errorMessage}>{state.error}</p>
        ) : null}

        {state.isLoading && items.length === 0 ? (
          <p className={styles.infoMessage}>Загружаем выбранные элементы...</p>
        ) : null}

        {!state.isLoading && items.length === 0 ? (
          <p className={styles.infoMessage}>Список выбранных элементов пока пуст.</p>
        ) : null}

        <SortableSelectedList
          items={items}
          itemIds={sortableIds}
          canLoadMore={state.hasMore}
          isLoadingMore={state.isLoadingMore}
          onLoadMore={() => void onLoadMore()}
          sensors={sensors}
          onDragEnd={onDragEnd}
          onAction={(id) => void onUnselectItem(id)}
          actionDisabled={isSelectionBusy}
        />

        {state.isLoadingMore ? (
          <p className={styles.loadingMoreMessage}>Подгружаем следующую порцию...</p>
        ) : null}
      </BoardColumn>
    </SectionCard>
  );
});
