export type ApiSuccessResponse<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorResponse = {
  error: {
    message: string;
    details: unknown | null;
  };
};
