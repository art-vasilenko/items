import type { Item, ItemsPage } from "@/entities/item/model/types";
import { request, type ApiSuccessResponse } from "@/shared/api/http";

type PageMeta = {
  limit: number;
  hasMore: boolean;
  nextCursor: string | null;
};

type BatchCommand =
  | { type: "add-items"; ids: number[] }
  | { type: "select-items"; ids: number[] }
  | { type: "unselect-items"; ids: number[] }
  | { type: "reorder-selected"; orderedIds: number[] };

type FlushBatchPayload = {
  processed: boolean;
  addItemsCount: number;
  selectionOperationsCount: number;
  reordered: boolean;
};

const createItemsQuery = (params: {
  limit?: number;
  query?: string;
  cursor?: string | null;
}) => {
  const searchParams = new URLSearchParams();

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.query) {
    searchParams.set("query", params.query);
  }

  if (params.cursor) {
    searchParams.set("cursor", params.cursor);
  }

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
};

const mapItemsPage = (
  response: ApiSuccessResponse<Item[]> & {
    meta: PageMeta;
  },
): ItemsPage => ({
  items: response.data,
  limit: response.meta.limit,
  hasMore: response.meta.hasMore,
  nextCursor: response.meta.nextCursor,
});

export const getAvailableItems = async (params: {
  limit?: number;
  query?: string;
  cursor?: string | null;
}) => {
  const path = `/api/v1/items/available${createItemsQuery(params)}`;
  const response = await request<
    ApiSuccessResponse<Item[]> & {
      meta: PageMeta;
    }
  >(path, {
    method: "GET",
  });

  return mapItemsPage(response);
};

export const getSelectedItems = async (params: {
  limit?: number;
  query?: string;
  cursor?: string | null;
}) => {
  const path = `/api/v1/items/selected${createItemsQuery(params)}`;
  const response = await request<
    ApiSuccessResponse<Item[]> & {
      meta: PageMeta;
    }
  >(path, {
    method: "GET",
  });

  return mapItemsPage(response);
};

export const flushItemsBatch = async (commands: BatchCommand[]) => {
  const response = await request<ApiSuccessResponse<FlushBatchPayload>>(
    "/api/v1/batch/flush",
    {
      method: "POST",
      body: { commands },
    },
  );

  return response.data;
};
