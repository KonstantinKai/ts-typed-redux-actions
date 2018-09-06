import { AsyncAction } from "./AsyncAction";
import { WithTasksAsyncPayload, StateGetter, DispatchTypedAction } from "../types";
import { BaseTypedAction } from "./BaseTypedAction";
import { wrapError } from "../utils";

export interface ParallelTasksPayload<S, R> extends WithTasksAsyncPayload<S, R> {
  tasks: Array<BaseTypedAction | { (getState: StateGetter<S>): BaseTypedAction | any }>;
}

export const getParallelTasksAsyncActionClass = () => class PTSuperClass<S, R> extends AsyncAction<ParallelTasksPayload<S, R>, S> {
  async execute(dispatch: DispatchTypedAction, getState: StateGetter<S>): Promise<R> {
    const results = await Promise.all(
      this.payload.tasks.map((task) => {
        let taskResult = null;

        if (typeof task === 'function') {
          try {
            taskResult = task(getState);
          } catch (error) {
            return wrapError(error);
          }
        }

        const typedAction = taskResult === null ? task : taskResult;

        return Promise.resolve(
          typedAction instanceof BaseTypedAction ?
            dispatch(typedAction as BaseTypedAction) :
            typedAction
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