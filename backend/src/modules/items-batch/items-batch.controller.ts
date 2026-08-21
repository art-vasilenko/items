import type { Request, Response } from "express";

import { asyncHandler } from "../../infrastructure/http/utils/async-handler";
import { sendResponse } from "../../infrastructure/http/utils/send-response";
import { flushBatchSchema } from "./dto/flush-batch.dto";
import { itemsBatchService } from "./items-batch.service";

export class ItemsBatchController {
  flush = asyncHandler(async (request: Request, response: Response) => {
    const payload = flushBatchSchema.parse(request.body);
    const result = await itemsBatchService.flush(payload);

    sendResponse(response, result);
  });
}

export const itemsBatchController = new ItemsBatchController();
