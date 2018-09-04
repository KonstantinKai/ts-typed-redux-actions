import { DispatchTypedAction, StateGetter, WithTasksAsyncPayload } from "../types";
import { AsyncAction } from "./AsyncAction";
import { BaseTypedAction } from "./BaseTypedAction";
import { wrapError } from "../utils";

type Task<S> = BaseTypedAction | { (prevResults: any[], getState: StateGetter<S>): BaseTypedAction | false };
export interface SeriesTasksPayload<S, R> extends WithTasksAsyncPayload<S, R> {
  tasks: Array<Task<S>>;
}

export const getSeriesTasksAsyncActionClass = () => class STSuperClass<S, R> extends AsyncAction<SeriesTasksPayload<S, R>, S> {
  async execute(dispatch: DispatchTypedAction, getState: StateGetter<S>): Promise<R> {
    const results = await (this.payload.tasks.reduce as any)((prevTask: Promise<any[]>, nextTask: Task<S>) =>
      prevTask.then((prevResults) => {
        let nextTaskResult = null;

        if (typeof nextTask === 'function') {
          try {
            nextTaskResult = nextTask(prevResults, getState);

            if (nextTaskResult === false) {
              return prevResults.concat([nextTaskResult]);
            }
          } catch(error) {
            return prevResults.concat([wrapError(error)]);
          }
        }

        const dispatchResult = dispatch(
          (nextTaskResult === null ? nextTask : nextTaskResult) as BaseTypedAction
        );

        return Promise.resolve(dispatchResult)
          .then((result: any) => prevResults.concat([result]))
          .catch((error) => prevResults.concat([wrapError(error)]));
      }), Promise.resolve([]));

    if (typeof this.payload.onComplete === 'function') {
      const onResolveResult = this.payload.onComplete(results, dispatch, getState);

      if (typeof onResolveResult !== 'undefined') {
        return onResolveResult;
      }
    }

    return results;
  }
}