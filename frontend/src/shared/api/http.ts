import { API_BASE_URL } from "@/shared/config/api";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export type ApiSuccessResponse<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export class ApiError extends Error {
  public readonly status: number;
  public readonly details: unknown;

  constructor(message: string, status: number, details: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { body, headers, ...restOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => null)) as
    | { data?: T; error?: { message?: string; details?: unknown } }
    | null;

  if (!response.ok) {
    throw new ApiError(
      payload?.error?.message ?? "Request failed",
      response.status,
      payload?.error?.details ?? null,
    );
  }

  return payload as T;
};
