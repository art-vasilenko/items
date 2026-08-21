import type { Response } from "express";

import type { ApiSuccessResponse } from "../../../shared/types/api-response.types";

export const sendResponse = <T>(
  response: Response,
  data: ApiSuccessResponse<T>["data"],
  meta?: ApiSuccessResponse<T>["meta"],
) => {
  response.json({
    data,
    meta,
  } satisfies ApiSuccessResponse<T>);
};
