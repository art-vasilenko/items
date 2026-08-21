import type { NextFunction, Request, Response } from "express";

const createRequestId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const requestIdMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const requestId = createRequestId();

  response.locals.requestId = requestId;
  response.setHeader("x-request-id", requestId);

  next();
};
