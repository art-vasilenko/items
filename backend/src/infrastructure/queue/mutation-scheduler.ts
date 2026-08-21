import {
  ADD_ITEMS_BATCH_INTERVAL_MS,
  SELECTION_BATCH_INTERVAL_MS,
} from "../../config/constants";
import { createDeferred, type Deferred } from "./create-deferred";
import { deduplicateIds } from "./deduplication";

type AddItemsResult = {
  addedIds: number[];
  skippedDuplicates?: number[];
  count: number;
};

type SelectionResult = {
  selectedIds: number[];
};

type SelectionOperation = "select" | "unselect";
type ReorderPayload =
  | { orderedIds: number[] }
  | { activeId: number; overId: number };

type QueueCommand =
  | { type: "add-items"; ids: number[] }
  | { type: "select-items"; ids: number[] }
  | { type: "unselect-items"; ids: number[] }
  | ({ type: "reorder-selected" } & ReorderPayload);

type PendingAddRequest = {
  ids: number[];
  deferred: Deferred<AddItemsResult>;
};

type PendingSelectionRequest = {
  deferred: Deferred<SelectionResult>;
};

export class MutationScheduler {
  private readonly addQueue = new Set<number>();
  private readonly pendingAddIds = new Set<number>();
  private readonly selectionOperations = new Map<number, SelectionOperation>();
  private pendingReorder: ReorderPayload | null = null;

  private readonly addRequests: PendingAddRequest[] = [];
  private readonly selectionRequests: PendingSelectionRequest[] = [];

  private addTimer: ReturnType<typeof setTimeout> | null = null;
  private selectionTimer: ReturnType<typeof setTimeout> | null = null;

  private activeAddFlush: Promise<void> | null = null;
  private activeSelectionFlush: Promise<void> | null = null;

  constructor(
    private readonly handlers: {
      addItems: (ids: number[]) => Promise<AddItemsResult>;
      applySelectionOperations: (
        operations: Map<number, SelectionOperation>,
      ) => Promise<SelectionResult>;
      applyReorder: (payload: ReorderPayload) => Promise<SelectionResult>;
    },
  ) {}

  enqueueAddItems(ids: number[]) {
    const uniqueIds = deduplicateIds(ids);
    const deferred = createDeferred<AddItemsResult>();
    const acceptedIds = uniqueIds.filter((id) => !this.pendingAddIds.has(id));

    if (acceptedIds.length === 0) {
      deferred.resolve({
        addedIds: [],
        count: 0,
      });
      return deferred.promise;
    }

    acceptedIds.forEach((id) => {
      this.addQueue.add(id);
      this.pendingAddIds.add(id);
    });

    this.addRequests.push({
      ids: acceptedIds,
      deferred,
    });

    this.planAddFlush();

    return deferred.promise;
  }

  enqueueSelection(ids: number[], operation: SelectionOperation) {
    ids.forEach((id) => {
      this.selectionOperations.set(id, operation);
    });

    const deferred = createDeferred<SelectionResult>();
    this.selectionRequests.push({ deferred });
    this.planSelectionFlush();

    return deferred.promise;
  }

  enqueueReorder(payload: ReorderPayload) {
    const deferred = createDeferred<SelectionResult>();

    this.pendingReorder =
      "orderedIds" in payload
        ? { orderedIds: [...payload.orderedIds] }
        : { activeId: payload.activeId, overId: payload.overId };

    this.selectionRequests.push({ deferred });
    this.planSelectionFlush();

    return deferred.promise;
  }

  async enqueueBatch(commands: QueueCommand[]) {
    const affectedAddIds = new Set<number>();
    const affectedSelectionIds = new Map<number, SelectionOperation>();
    let reordered = false;

    for (const command of commands) {
      if (command.type === "add-items") {
        command.ids.forEach((id) => affectedAddIds.add(id));
        await this.enqueueAddItems(command.ids);
        continue;
      }

      if (command.type === "select-items") {
        command.ids.forEach((id) => affectedSelectionIds.set(id, "select"));
        await this.enqueueSelection(command.ids, "select");
        continue;
      }

      if (command.type === "unselect-items") {
        command.ids.forEach((id) => affectedSelectionIds.set(id, "unselect"));
        await this.enqueueSelection(command.ids, "unselect");
        continue;
      }

      reordered = true;
      await this.enqueueReorder(
        "orderedIds" in command
          ? { orderedIds: command.orderedIds }
          : { activeId: command.activeId, overId: command.overId },
      );
    }

    return {
      processed: true,
      addItemsCount: affectedAddIds.size,
      selectionOperationsCount: affectedSelectionIds.size,
      reordered,
    };
  }

  reset() {
    this.addQueue.clear();
    this.pendingAddIds.clear();
    this.selectionOperations.clear();
    this.pendingReorder = null;
    this.addRequests.splice(0, this.addRequests.length);
    this.selectionRequests.splice(0, this.selectionRequests.length);

    if (this.addTimer) {
      clearTimeout(this.addTimer);
      this.addTimer = null;
    }

    if (this.selectionTimer) {
      clearTimeout(this.selectionTimer);
      this.selectionTimer = null;
    }

    this.activeAddFlush = null;
    this.activeSelectionFlush = null;
  }

  private planAddFlush() {
    if (this.addTimer) {
      return;
    }

    this.addTimer = setTimeout(() => {
      this.addTimer = null;
      void this.flushAddQueue();
    }, ADD_ITEMS_BATCH_INTERVAL_MS);
  }

  private planSelectionFlush() {
    if (this.selectionTimer) {
      return;
    }

    this.selectionTimer = setTimeout(() => {
      this.selectionTimer = null;
      void this.flushSelectionQueue();
    }, SELECTION_BATCH_INTERVAL_MS);
  }

  private resolveAddRequests(
    requests: PendingAddRequest[],
    result: AddItemsResult,
  ) {
    const addedIdSet = new Set(result.addedIds);
    const duplicateIdSet = new Set(result.skippedDuplicates ?? []);

    requests.forEach(({ ids: requestIds, deferred }) => {
      const requestAddedIds = requestIds.filter((id) => addedIdSet.has(id));
      const requestSkippedDuplicates = requestIds.filter((id) =>
        duplicateIdSet.has(id),
      );

      deferred.resolve({
        addedIds: requestAddedIds,
        skippedDuplicates: requestSkippedDuplicates,
        count: requestAddedIds.length,
      });
    });
  }

  private async flushAddQueue() {
    if (this.addTimer) {
      clearTimeout(this.addTimer);
      this.addTimer = null;
    }

    if (this.activeAddFlush) {
      await this.activeAddFlush;
      return;
    }

    const ids = [...this.addQueue];
    const requests = this.addRequests.splice(0, this.addRequests.length);

    if (ids.length === 0) {
      requests.forEach(({ deferred }) => {
        deferred.resolve({
          addedIds: [],
          count: 0,
        });
      });
      return;
    }

    this.addQueue.clear();

    this.activeAddFlush = (async () => {
      try {
        const result = await this.handlers.addItems(ids);
        this.resolveAddRequests(requests, result);
      } catch (error) {
        requests.forEach(({ deferred }) => deferred.reject(error));
      } finally {
        ids.forEach((id) => this.pendingAddIds.delete(id));
        this.activeAddFlush = null;

        if (this.addQueue.size > 0) {
          this.planAddFlush();
        }
      }
    })();

    await this.activeAddFlush;
  }

  private async flushSelectionQueue() {
    if (this.selectionTimer) {
      clearTimeout(this.selectionTimer);
      this.selectionTimer = null;
    }

    if (this.activeSelectionFlush) {
      await this.activeSelectionFlush;
      return;
    }

    const operations = new Map(this.selectionOperations);
    const pendingReorder = this.pendingReorder
      ? "orderedIds" in this.pendingReorder
        ? { orderedIds: [...this.pendingReorder.orderedIds] }
        : {
            activeId: this.pendingReorder.activeId,
            overId: this.pendingReorder.overId,
          }
      : null;
    const requests = this.selectionRequests.splice(
      0,
      this.selectionRequests.length,
    );

    if (operations.size === 0 && pendingReorder === null) {
      const selectedIds = await this.handlers.applySelectionOperations(
        new Map(),
      );
      requests.forEach(({ deferred }) => deferred.resolve(selectedIds));
      return;
    }

    this.selectionOperations.clear();
    this.pendingReorder = null;

    this.activeSelectionFlush = (async () => {
      try {
        let selectionResult =
          await this.handlers.applySelectionOperations(operations);

        if (pendingReorder !== null) {
          selectionResult = await this.handlers.applyReorder(pendingReorder);
        }

        requests.forEach(({ deferred }) => deferred.resolve(selectionResult));
      } catch (error) {
        requests.forEach(({ deferred }) => deferred.reject(error));
      } finally {
        this.activeSelectionFlush = null;

        if (this.selectionOperations.size > 0 || this.pendingReorder !== null) {
          this.planSelectionFlush();
        }
      }
    })();

    await this.activeSelectionFlush;
  }
}
