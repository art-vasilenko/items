import { AppError } from "./app.error";
import { HTTP_STATUS_CODES } from "../shared/constants/http-status-codes";

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, HTTP_STATUS_CODES.CONFLICT, details);
    this.name = "ConflictError";
  }
}
