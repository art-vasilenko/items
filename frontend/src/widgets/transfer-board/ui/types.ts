import type { DragEndEvent, useSensors } from "@dnd-kit/core";

export type ListState = {
  items: { id: number }[];
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
};

export type AvailableItemView = {
  id: number;
  tone: "neutral" | "accent" | "selected" | "manual";
};

export type SelectedItemView = {
  id: number;
  prefix: string;
  tone: "selected" | "manual";
};

export type TransferBoardHeaderProps = {
  availableCount: number;
  selectedCount: number;
};

export type AvailableItemsColumnProps = {
  filter: string;
  manualItemId: string;
  manualItemError: string | null;
  isSubmittingManualItem: boolean;
  isMutatingSelection: boolean;
  state: ListState;
  items: AvailableItemView[];
  onFilterChange: (value: string) => void;
  onManualItemChange: (value: string) => void;
  onSelectItem: (id: number) => Promise<void>;
  onSubmitManualItem: () => Promise<void>;
  onLoadMore: () => Promise<void>;
};

export type SelectedItemsColumnProps = {
  filter: string;
  isSelectionBusy: boolean;
  state: ListState;
  items: SelectedItemView[];
  sortableIds: string[];
  sensors: ReturnType<typeof useSensors>;
  onFilterChange: (value: string) => void;
  onUnselectItem: (id: number) => Promise<void>;
  onLoadMore: () => Promise<void>;
  onDragEnd: (event: DragEndEvent) => void;
};
