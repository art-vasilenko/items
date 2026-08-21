import type { ItemEntity } from "../../domain/entities/item.entity";
import {
  decodeAvailableCursor,
  decodeSelectedCursor,
  encodeAvailableCursor,
  encodeSelectedCursor,
} from "../../shared/lib/cursor";
import type { CursorPaginatedResult } from "../../shared/types/common.types";
import { selectionRepository } from "../selection/selection.repository";
import type { AddCustomItemsDto } from "./dto/add-custom-items.dto";
import type { GetAvailableItemsDto } from "./dto/get-available-items.dto";
import type { GetSelectedItemsDto } from "./dto/get-selected-items.dto";
import { itemsRepository } from "./items.repository";

export class ItemsService {
  async getAvailableItems(query: GetAvailableItemsDto): Promise<CursorPaginatedResult<ItemEntity>> {
    const selectedIds = selectionRepository.getSelectedIds();
    const { start, end } = itemsRepository.getBaseRange();
    const cursorPayload = query.cursor ? decodeAvailableCursor(query.cursor) : null;
    const lastSeenId = cursorPayload?.lastSeenId ?? start - 1;
    const normalizedQuery = query.query.trim();

    if (!normalizedQuery) {
      return this.getAvailableItemsWithoutFilter({
        limit: query.limit,
        start,
        end,
        lastSeenId,
        selectedIds,
      });
    }

    return this.getAvailableItemsWithFilter({
      limit: query.limit,
      lastSeenId,
      selectedIds,
      query: normalizedQuery,
    });
  }

  async getSelectedItems(query: GetSelectedItemsDto): Promise<CursorPaginatedResult<ItemEntity>> {
    const orderedIds = selectionRepository.getSelectedOrder();
    const filtered = orderedIds.filter((id) => this.matchesQuery(id, query.query));
    const cursorPayload = query.cursor ? decodeSelectedCursor(query.cursor) : null;
    const startIndex = cursorPayload ? cursorPayload.lastSeenIndex + 1 : 0;
    const pageIds = filtered.slice(startIndex, startIndex + query.limit + 1);

    return this.buildSelectedPage(pageIds, startIndex, query.limit);
  }

  async addCustomItems(payload: AddCustomItemsDto) {
    const uniqueIds = [...new Set(payload.ids)];
    const duplicates = uniqueIds.filter((id) => itemsRepository.isKnownId(id));
    const addedIds = uniqueIds.filter((id) => !itemsRepository.isKnownId(id));

    if (addedIds.length > 0) {
      itemsRepository.addCustomIds(addedIds);
    }

    return {
      addedIds,
      skippedDuplicates: duplicates,
      count: addedIds.length,
    };
  }

  private getAvailableItemsWithoutFilter(params: {
    limit: number;
    start: number;
    end: number;
    lastSeenId: number;
    selectedIds: Set<number>;
  }): CursorPaginatedResult<ItemEntity> {
    const pageIds: number[] = [];

    for (let id = Math.max(params.start, params.lastSeenId + 1); id <= params.end; id += 1) {
      if (params.selectedIds.has(id)) {
        continue;
      }

      pageIds.push(id);

      if (pageIds.length === params.limit + 1) {
        return this.buildAvailablePage(pageIds, params.limit);
      }
    }

    for (const id of itemsRepository.getSortedCustomIds()) {
      if (id <= params.lastSeenId) {
        continue;
      }

      if (params.selectedIds.has(id)) {
        continue;
      }

      pageIds.push(id);

      if (pageIds.length === params.limit + 1) {
        return this.buildAvailablePage(pageIds, params.limit);
      }
    }

    return this.buildAvailablePage(pageIds, params.limit);
  }

  private getAvailableItemsWithFilter(params: {
    limit: number;
    lastSeenId: number;
    selectedIds: Set<number>;
    query: string;
  }): CursorPaginatedResult<ItemEntity> {
    const pageIds: number[] = [];
    const { start, end } = itemsRepository.getBaseRange();

    for (let id = Math.max(start, params.lastSeenId + 1); id <= end; id += 1) {
      if (params.selectedIds.has(id) || !this.matchesQuery(id, params.query)) {
        continue;
      }

      pageIds.push(id);

      if (pageIds.length === params.limit + 1) {
        return this.buildAvailablePage(pageIds, params.limit);
      }
    }

    for (const id of itemsRepository.getSortedCustomIds()) {
      if (id <= params.lastSeenId) {
        continue;
      }

      if (params.selectedIds.has(id) || !this.matchesQuery(id, params.query)) {
        continue;
      }

      pageIds.push(id);

      if (pageIds.length === params.limit + 1) {
        return this.buildAvailablePage(pageIds, params.limit);
      }
    }

    return this.buildAvailablePage(pageIds, params.limit);
  }

  private matchesQuery(id: number, query: string) {
    if (!query) {
      return true;
    }

    return String(id).includes(query);
  }

  private buildAvailablePage(
    ids: number[],
    limit: number,
  ): CursorPaginatedResult<ItemEntity> {
    const hasMore = ids.length > limit;
    const pagedIds = hasMore ? ids.slice(0, limit) : ids;
    const lastId = pagedIds.at(-1) ?? null;

    return {
      items: pagedIds.map((id) => itemsRepository.toItemEntity(id)),
      limit,
      hasMore,
      nextCursor: hasMore && lastId !== null
        ? encodeAvailableCursor(lastId)
        : null,
    };
  }

  private buildSelectedPage(
    ids: number[],
    startIndex: number,
    limit: number,
  ): CursorPaginatedResult<ItemEntity> {
    const hasMore = ids.length > limit;
    const pagedIds = hasMore ? ids.slice(0, limit) : ids;
    const lastSeenIndex = startIndex + pagedIds.length - 1;

    return {
      items: pagedIds.map((id) => itemsRepository.toItemEntity(id)),
      limit,
      hasMore,
      nextCursor: hasMore && pagedIds.length > 0
        ? encodeSelectedCursor(lastSeenIndex)
        : null,
    };
  }
}

export const itemsService = new ItemsService();
