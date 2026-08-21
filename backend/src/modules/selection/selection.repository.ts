import type { ItemId } from "../../shared/types/common.types";
import { appState } from "../../infrastructure/storage/app-state";

export interface SelectionRepository {
  getSelectedIds(): Set<ItemId>;
  getSelectedOrder(): ItemId[];
  addSelectedIds(ids: ItemId[]): void;
  removeSelectedIds(ids: ItemId[]): void;
  moveSelectedId(activeId: ItemId, overId: ItemId): void;
  mergeSelectedSubset(ids: ItemId[]): void;
}

class InMemorySelectionRepository implements SelectionRepository {
  getSelectedIds() {
    return new Set(appState.selectedIds);
  }

  getSelectedOrder() {
    return [...appState.selectedOrder];
  }

  addSelectedIds(ids: ItemId[]) {
    ids.forEach((id) => {
      if (!appState.selectedIds.has(id)) {
        appState.selectedIds.add(id);
        appState.selectedOrder.push(id);
      }
    });
  }

  removeSelectedIds(ids: ItemId[]) {
    ids.forEach((id) => {
      appState.selectedIds.delete(id);
    });

    appState.selectedOrder = appState.selectedOrder.filter((id) => !ids.includes(id));
  }

  moveSelectedId(activeId: ItemId, overId: ItemId) {
    const activeIndex = appState.selectedOrder.indexOf(activeId);
    const overIndex = appState.selectedOrder.indexOf(overId);

    if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
      return;
    }

    const nextOrder = [...appState.selectedOrder];
    const [movedId] = nextOrder.splice(activeIndex, 1);
    nextOrder.splice(overIndex, 0, movedId);
    appState.selectedOrder = nextOrder;
  }

  mergeSelectedSubset(ids: ItemId[]) {
    const subsetSet = new Set(ids);
    let reorderedIndex = 0;

    appState.selectedOrder = appState.selectedOrder.map((id) => {
      if (!subsetSet.has(id)) {
        return id;
      }

      const nextId = ids[reorderedIndex];
      reorderedIndex += 1;
      return nextId;
    });
  }
}

export const selectionRepository = new InMemorySelectionRepository();
