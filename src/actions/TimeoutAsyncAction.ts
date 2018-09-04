import { AsyncAction } from "./AsyncAction";
import { DispatchTypedAction, StateGetter } from "../types";
import { SimpleAsyncActionPayload } from "./SimpleAsyncAction";

type TimeoutAsyncActionReturn = () => void;
interface TimeoutAsyncActionPayload<S> extends SimpleAsyncActionPayload<S, any> {
  timeout: number;
}
export const getTimeoutAsyncActionClass = () => class TSuperClass<S> extends AsyncAction<TimeoutAsyncActionPayload<S>, S> {
  execute(dispatch: DispatchTypedAction, getState: StateGetter<S>): TimeoutAsyncActionReturn {
    const timeout = setTimeout(() => this.payload.executor(dispatch, getState), this.payload.timeout);
    return () => clearTimeout(timeout);
  }
};