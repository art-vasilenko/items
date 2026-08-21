import type { NextFunction, Request, Response } from "express";

import { NotFoundError } from "../../../errors/not-found.error";
import { ERROR_MESSAGES } from "../../../shared/constants/error-messages";

export const notFoundMiddleware = (
  _request: Request,
  _response: Response,
  next: NextFunction,
) => {
  next(new NotFoundError(ERROR_MESSAGES.ROUTE_NOT_FOUND));
};
