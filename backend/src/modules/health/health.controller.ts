import type { Request, Response } from "express";

import { sendResponse } from "../../infrastructure/http/utils/send-response";

export class HealthController {
  getStatus(_request: Request, response: Response) {
    sendResponse(response, {
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  }
}

export const healthController = new HealthController();
