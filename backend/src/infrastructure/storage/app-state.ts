import {
  DEFAULT_BASE_RANGE_END,
  DEFAULT_BASE_RANGE_START,
} from "../../config/constants";
import type { ItemId } from "../../shared/types/common.types";

export type AppState = {
  baseRange: {
    start: number;
    end: number;
  };
  customIds: Set<ItemId>;
  sortedCustomIds: ItemId[];
  selectedIds: Set<ItemId>;
  selectedOrder: ItemId[];
};

export const appState: AppState = {
  baseRange: {
    start: DEFAULT_BASE_RANGE_START,
    end: DEFAULT_BASE_RANGE_END,
  },
  customIds: new Set<ItemId>(),
  sortedCustomIds: [],
  selectedIds: new Set<ItemId>(),
  selectedOrder: [],
};

export const resetAppState = () => {
  appState.baseRange.start = DEFAULT_BASE_RANGE_START;
  appState.baseRange.end = DEFAULT_BASE_RANGE_END;
  appState.customIds.clear();
  appState.sortedCustomIds = [];
  appState.selectedIds.clear();
  appState.selectedOrder = [];
};
