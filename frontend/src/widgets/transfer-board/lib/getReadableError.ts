import { ApiError } from "@/shared/api/http";

export const getReadableError = (error: unknown) => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Не удалось выполнить запрос";
};
