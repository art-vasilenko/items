import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Item } from "@/entities/item/model/types";
import { getSelectedItems } from "@/entities/item/api/items-api";
import { DEFAULT_PAGE_SIZE } from "@/shared/config/pagination";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";

import { getReadableError } from "../lib/getReadableError";
import { reorderArray } from "../lib/reorderArray";
import { resolveSelectedItemTone } from "../lib/resolveItemTone";
import {
  createInitialListState,
  hasItem,
  type LoadedListState,
  matchesItemFilter,
  removeItem,
  type SelectedViewItem,
} from "./types";

export const useSelectedItems = () => {
  const [filter, setFilter] = useState("");
  const [state, setState] = useState<LoadedListState>(createInitialListState);
  const latestRequestIdRef = useRef(0);

  const debouncedFilter = useDebouncedValue(filter.trim());

  const load = useCallback(
    async (mode: "replace" | "append", cursor?: string | null) => {
      const requestId = latestRequestIdRef.current + 1;
      latestRequestIdRef.current = requestId;

      setState((currentState) => ({
        ...currentState,
        isLoading: mode === "replace",
        isLoadingMore: mode === "append",
        error: mode === "replace" ? null : currentState.error,
      }));

      try {
        const page = await getSelectedItems({
          limit: DEFAULT_PAGE_SIZE,
          query: debouncedFilter,
          cursor,
        });

        if (latestRequestIdRef.current !== requestId) {
          return;
        }

        setState((currentState) => ({
          items: mode === "append" ? [...currentState.items, ...page.items] : page.items,
          hasMore: page.hasMore,
          nextCursor: page.nextCursor,
          isLoading: false,
          isLoadingMore: false,
          error: null,
        }));
      } catch (error) {
        if (latestRequestIdRef.current !== requestId) {
          return;
        }

        setState((currentState) => ({
          ...currentState,
          isLoading: false,
          isLoadingMore: false,
          error: getReadableError(error),
        }));
      }
    },
    [debouncedFilter],
  );

  useEffect(() => {
    void load("replace");
  }, [load]);

  const items = useMemo<SelectedViewItem[]>(
    () =>
      state.items.map((item, index) => ({
        ...item,
        tone: resolveSelectedItemTone(item.id),
        prefix: `#${index + 1}`,
      })),
    [state.items],
  );

  const reorderItemsLocally = useCallback((activeId: number, overId: number) => {
    setState((currentState) => ({
      ...currentState,
      items: reorderArray(currentState.items, activeId, overId),
    }));
  }, []);

  const addItemLocally = useCallback((item: Item) => {
    setState((currentState) => {
      if (!matchesItemFilter(item.id, debouncedFilter)) {
        return currentState;
      }

      if (hasItem(currentState.items, item.id)) {
        return currentState;
      }

      return {
        ...currentState,
        items: [...currentState.items, item],
      };
    });
  }, [debouncedFilter]);

  const removeItemLocally = useCallback((itemId: number) => {
    setState((currentState) => ({
      ...currentState,
      items: removeItem(currentState.items, itemId),
    }));
  }, []);

  return {
    filter,
    state,
    items,
    itemIds: state.items.map((item) => item.id),
    setFilter,
    reload: () => load("replace"),
    loadMore: () => load("append", state.nextCursor),
    addItemLocally,
    removeItemLocally,
    reorderItemsLocally,
  };
};
