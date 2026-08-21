export type Item = {
  id: number;
};

export type ItemsPage = {
  items: Item[];
  limit: number;
  hasMore: boolean;
  nextCursor: string | null;
};
