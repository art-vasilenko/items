import { resetAppState } from "../infrastructure/storage/app-state";
import { mutationScheduler, readRequestScheduler } from "../infrastructure/queue/server-schedulers";

export const resetTestState = () => {
  resetAppState();
  readRequestScheduler.reset();
  mutationScheduler.reset();
};
