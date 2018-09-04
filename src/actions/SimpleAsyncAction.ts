import { AsyncAction } from "./AsyncAction";
import { DispatchTypedAction, StateGetter } from "../types";

type Executor<S, R> = (dispatch: DispatchTypedAction, getState: StateGetter<S>) => Promise<R>;
export interface SimpleAsyncActionPayload<S, R> {
  executor: Executor<S, R>;
}

export const getSimpleAsyncActionClass = () => class SSuperClass<S, R> extends AsyncAction<SimpleAsyncActionPayload<S, R>, S> {
  execute(dispatch: DispatchTypedAction, getState: StateGetter<S>): Promise<R> {
    return this.payload.executor(dispatch, getState);
  }
}