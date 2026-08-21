export type Deferred<TValue> = {
  promise: Promise<TValue>;
  resolve: (value: TValue) => void;
  reject: (error: unknown) => void;
};

export const createDeferred = <TValue>(): Deferred<TValue> => {
  let resolve: ((value: TValue) => void) | null = null;
  let reject: ((error: unknown) => void) | null = null;

  const promise = new Promise<TValue>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  if (resolve === null || reject === null) {
    throw new Error("Deferred handlers were not initialized");
  }

  return {
    promise,
    resolve,
    reject,
  };
};
