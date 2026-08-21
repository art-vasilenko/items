import type { ItemEntity } from "../../domain/entities/item.entity";
import type { ItemId } from "../../shared/types/common.types";
import { appState } from "../../infrastructure/storage/app-state";

export interface ItemsRepository {
  getBaseRange(): { start: number; end: number };
  getSortedCustomIds(): ItemId[];
  addCustomIds(ids: ItemId[]): void;
  isKnownId(id: ItemId): boolean;
  toItemEntity(id: ItemId): ItemEntity;
}

class InMemoryItemsRepository implements ItemsRepository {
  private findInsertIndex(ids: ItemId[], targetId: ItemId) {
    let left = 0;
    let right = ids.length;

    while (left < right) {
      const middle = Math.floor((left + right) / 2);

      if (ids[middle] < targetId) {
        left = middle + 1;
      } else {
        right = middle;
      }
    }

    return left;
  }

  getBaseRange() {
    return appState.baseRange;
  }

  getSortedCustomIds() {
    return [...appState.sortedCustomIds];
  }

  addCustomIds(ids: ItemId[]) {
    ids.forEach((id) => {
      if (!appState.customIds.has(id)) {
        appState.customIds.add(id);
        const insertIndex = this.findInsertIndex(appState.sortedCustomIds, id);
        appState.sortedCustomIds.splice(insertIndex, 0, id);
      }
    });
  }

  isKnownId(id: ItemId) {
    const { start, end } = appState.baseRange;
    return (id >= start && id <= end) || appState.customIds.has(id);
  }

  toItemEntity(id: ItemId): ItemEntity {
    return { id };
  }
}

export const itemsRepository = new InMemoryItemsRepository();
