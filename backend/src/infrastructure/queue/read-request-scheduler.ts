import { READ_BATCH_INTERVAL_MS } from "../../config/constants";
import { createDeferred } from "./create-deferred";

type PendingTask<TValue> = {
  run: () => Promise<void>;
  promise: Promise<TValue>;
};

class ReadRequestScheduler {
  private readonly pendingTasks = new Map<string, PendingTask<unknown>>();
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private lastFlushAt = 0;

  schedule<TValue>(key: string, execute: () => Promise<TValue>) {
    const existingTask = this.pendingTasks.get(key);

    if (existingTask) {
      return existingTask.promise as Promise<TValue>;
    }

    const deferred = createDeferred<TValue>();
    const task: PendingTask<TValue> = {
      run: async () => {
        try {
          const result = await execute();
          deferred.resolve(result);
        } catch (error) {
          deferred.reject(error);
        }
      },
      promise: deferred.promise,
    };

    this.pendingTasks.set(key, task as PendingTask<unknown>);
    this.planFlush();

    return task.promise;
  }

  reset() {
    this.pendingTasks.clear();

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    this.lastFlushAt = 0;
  }

  private planFlush() {
    if (this.flushTimer) {
      return;
    }

    const elapsedMs = Date.now() - this.lastFlushAt;
    const delayMs = Math.max(0, READ_BATCH_INTERVAL_MS - elapsedMs);

    this.flushTimer = setTimeout(() => {
      void this.flush();
    }, delayMs);
  }

  private async flush() {
    this.flushTimer = null;
    this.lastFlushAt = Date.now();

    const tasks = [...this.pendingTasks.values()];
    this.pendingTasks.clear();

    await Promise.allSettled(tasks.map(async (task) => task.run()));

    if (this.pendingTasks.size > 0) {
      this.planFlush();
    }
  }
}

export const readRequestScheduler = new ReadRequestScheduler();
