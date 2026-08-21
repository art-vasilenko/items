import { mutationScheduler } from "../../infrastructure/queue/server-schedulers";
import type { FlushBatchDto } from "./dto/flush-batch.dto";

export class ItemsBatchService {
  async flush(payload: FlushBatchDto) {
    return mutationScheduler.enqueueBatch(
      payload.commands.map((command) => {
        if (command.type !== "reorder-selected") {
          return command;
        }

        return Array.isArray(command.orderedIds)
          ? {
            type: "reorder-selected" as const,
            orderedIds: command.orderedIds,
          }
          : {
            type: "reorder-selected" as const,
            activeId: command.activeId!,
            overId: command.overId!,
          };
      }),
    );
  }
}

export const itemsBatchService = new ItemsBatchService();
