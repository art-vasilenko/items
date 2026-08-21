import { memo, type CSSProperties } from "react";
import {
  DndContext,
  closestCenter,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { ItemCard } from "@/entities/item";
import { VirtualList } from "@/shared/ui/VirtualList/VirtualList";

import styles from "./TransferBoardWidget.module.css";

type SortableSelectedItemModel = {
  id: number;
  prefix: string;
  tone: "selected" | "manual";
};

type SortableSelectedListProps = {
  items: SortableSelectedItemModel[];
  itemIds: string[];
  actionDisabled: boolean;
  canLoadMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  sensors: ReturnType<typeof useSensors>;
  onAction: (id: number) => void;
  onDragEnd: (event: DragEndEvent) => void;
};

type SortableSelectedItemProps = SortableSelectedItemModel & {
  actionDisabled: boolean;
  onAction: () => void;
};

const SortableSelectedItem = memo(({
  id,
  prefix,
  tone,
  actionDisabled,
  onAction,
}: SortableSelectedItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(id) });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.72 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.sortableItem}
      {...attributes}
      {...listeners}
    >
      <ItemCard
        id={id}
        tone={tone}
        prefix={prefix}
        actionLabel="Убрать"
        onAction={onAction}
        actionDisabled={actionDisabled}
      />
    </div>
  );
});

export const SortableSelectedList = memo(({
  items,
  itemIds,
  actionDisabled,
  canLoadMore,
  isLoadingMore,
  onLoadMore,
  sensors,
  onAction,
  onDragEnd,
}: SortableSelectedListProps) => {
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <VirtualList
          items={items}
          estimateItemHeight={88}
          className={styles.listViewport}
          canLoadMore={canLoadMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={onLoadMore}
          renderItem={(item) => (
            <SortableSelectedItem
              key={item.id}
              id={item.id}
              tone={item.tone}
              prefix={item.prefix}
              onAction={() => onAction(item.id)}
              actionDisabled={actionDisabled}
            />
          )}
        />
      </SortableContext>
    </DndContext>
  );
});
