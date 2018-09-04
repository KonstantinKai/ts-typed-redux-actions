import { AsyncAction } from "./AsyncAction";
import { WithTasksAsyncPayload, StateGetter, DispatchTypedAction } from "../types";
import { BaseTypedAction } from "./BaseTypedAction";
import { wrapError } from "../utils";

export interface ParallelTasksPayload<S, R> extends WithTasksAsyncPayload<S, R> {
  tasks: Array<BaseTypedAction | { (getState: StateGetter<S>): BaseTypedAction | false }>;
}

export const getParallelTasksAsyncActionClass = () => class PTSuperClass<S, R> extends AsyncAction<ParallelTasksPayload<S, R>, S> {
  async execute(dispatch: DispatchTypedAction, getState: StateGetter<S>): Promise<R> {
    const results = await Promise.all(
      this.payload.tasks.map((task) => {
        let taskResult = null;

        if (typeof task === 'function') {
          try {
            taskResult = task(getState);

            if (taskResult === false) {
              return taskResult;
            }
          } catch (error) {
            return wrapError(error);
          }
        }

        return Promise.resolve(
          dispatch((taskResult === null ? task : taskResult) as BaseTypedAction)
        ).catch((error) => wrapError(error));
      })
    );

    if (typeof this.payload.onComplete === 'function') {
      const onResolveResult = this.payload.onComplete(results, dispatch, getState);

      if (typeof onResolveResult !== 'undefined') {
        return onResolveResult;
      }
    }

    return results as any;
  }
}