import type { Response } from "express";

import type { HttpStatusCode } from "../../../shared/constants/http-status-codes";
import type { ApiErrorResponse } from "../../../shared/types/api-response.types";

export const sendErrorResponse = (
  response: Response,
  statusCode: HttpStatusCode,
  message: string,
  details: unknown | null = null,
) => {
  response.status(statusCode).json({
    error: {
      message,
      details,
    },
  } satisfies ApiErrorResponse);
};
