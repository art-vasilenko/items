import {
  HTTP_STATUS_CODES,
  type HttpStatusCode,
} from "../shared/constants/http-status-codes";

export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: HttpStatusCode = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}
