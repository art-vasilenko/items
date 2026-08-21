export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_BASE_RANGE_START = 1;
export const DEFAULT_BASE_RANGE_END = 1_000_000;
export const MAX_PAGE_SIZE = 100;
export const MAX_SAFE_ID = Number.MAX_SAFE_INTEGER;

const IS_TEST_ENV = process.env.NODE_ENV === "test";

export const READ_BATCH_INTERVAL_MS = IS_TEST_ENV ? 5 : 1_000;
export const SELECTION_BATCH_INTERVAL_MS = IS_TEST_ENV ? 5 : 1_000;
export const ADD_ITEMS_BATCH_INTERVAL_MS = IS_TEST_ENV ? 10 : 10_000;
