import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "../../../errors/app.error";
import { ValidationError } from "../../../errors/validation.error";
import { ERROR_MESSAGES } from "../../../shared/constants/error-messages";
import { HTTP_STATUS_CODES } from "../../../shared/constants/http-status-codes";
import { sendErrorResponse } from "../utils/send-error-response";

const isJsonSyntaxError = (error: unknown) => {
  if (!(error instanceof SyntaxError)) {
    return false;
  }

  return "body" in (error as object);
};

export const errorHandlerMiddleware = (
  error: unknown,
  _request: Request,
  response: Response,
  next: NextFunction,
) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (isJsonSyntaxError(error)) {
    const normalizedError = new ValidationError(ERROR_MESSAGES.MALFORMED_JSON_REQUEST_BODY);

    sendErrorResponse(
      response,
      normalizedError.statusCode,
      normalizedError.message,
      normalizedError.details ?? null,
    );
    return;
  }

  if (error instanceof AppError) {
    sendErrorResponse(
      response,
      error.statusCode,
      error.message,
      error.details ?? null,
    );
    return;
  }

  if (error instanceof ZodError) {
    sendErrorResponse(
      response,
      HTTP_STATUS_CODES.BAD_REQUEST,
      ERROR_MESSAGES.VALIDATION_FAILED,
      error.flatten(),
    );
    return;
  }

  sendErrorResponse(
    response,
    HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    null,
  );
};
