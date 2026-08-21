export type ItemId = number;

export type CursorPaginatedResult<T> = {
  items: T[];
  limit: number;
  hasMore: boolean;
  nextCursor: string | null;
};
