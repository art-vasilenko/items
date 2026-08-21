import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { Item } from "@/entities/item/model/types";
import { getAvailableItems } from "@/entities/item/api/items-api";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { DEFAULT_PAGE_SIZE } from "@/shared/config/pagination";

import { getReadableError } from "../lib/getReadableError";
import { resolveAvailableItemTone } from "../lib/resolveItemTone";
import {
  createInitialListState,
  hasItem,
  type LoadedListState,
  matchesItemFilter,
  removeItem,
} from "./types";

export const useAvailableItems = () => {
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
        const page = await getAvailableItems({
          limit: DEFAULT_PAGE_SIZE,
          query: debouncedFilter,
          cursor,
        });

        if (latestRequestIdRef.current !== requestId) {
          return;
        }

        setState((currentState) => ({
          items:
            mode === "append"
              ? [...currentState.items, ...page.items]
              : page.items,
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

  const items = useMemo(
    () =>
      state.items.map((item) => ({
        ...item,
        tone: resolveAvailableItemTone(item.id),
      })),
    [state.items],
  );

  const removeItemLocally = useCallback((itemId: number) => {
    setState((currentState) => ({
      ...currentState,
      items: removeItem(currentState.items, itemId),
    }));
  }, []);

  const addItemLocally = useCallback(
    (item: Item) => {
      setState((currentState) => {
        if (!matchesItemFilter(item.id, debouncedFilter)) {
          return currentState;
        }

        if (hasItem(currentState.items, item.id)) {
          return currentState;
        }

        const nextItems = [...currentState.items];
        const insertIndex = nextItems.findIndex(
          (currentItem) => currentItem.id > item.id,
        );

        if (insertIndex === -1) {
          nextItems.push(item);
        } else {
          nextItems.splice(insertIndex, 0, item);
        }

        return {
          ...currentState,
          items: nextItems,
        };
      });
    },
    [debouncedFilter],
  );

  return {
    filter,
    state,
    items,
    setFilter,
    reload: () => load("replace"),
    loadMore: () => load("append", state.nextCursor),
    addItemLocally,
    removeItemLocally,
  };
};
