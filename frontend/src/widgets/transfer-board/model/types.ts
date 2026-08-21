import type { Item } from "@/entities/item/model/types";

export type LoadedListState = {
  items: Item[];
  nextCursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
};

export type SelectedViewItem = Item & {
  tone: "selected" | "manual";
  prefix: string;
};

export const createInitialListState = (): LoadedListState => ({
  items: [],
  nextCursor: null,
  hasMore: false,
  isLoading: true,
  isLoadingMore: false,
  error: null,
});

export const matchesItemFilter = (id: number, query: string) =>
  query.length === 0 || String(id).includes(query);

export const hasItem = (items: Item[], itemId: number) =>
  items.some((item) => item.id === itemId);

export const removeItem = (items: Item[], itemId: number) =>
  items.filter((item) => item.id !== itemId);
