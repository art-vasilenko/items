export const HTTP_STATUS_CODES = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatusCode = (typeof HTTP_STATUS_CODES)[keyof typeof HTTP_STATUS_CODES];
