import { BaseTypedAction, ReducerActionArg } from "./actions/BaseTypedAction";
import { Reducer } from 'redux';

export type ReducerTypedAction<S> = Reducer<S, ReducerActionArg>;

export type StateGetter<S> = () => S;

export type DispatchTypedAction = (action: BaseTypedAction) => any;

export interface WithTasksAsyncPayload<S, R> {
  onComplete?: (results: any[], dispatch: DispatchTypedAction, getState: StateGetter<S>) => R;
}

export interface WrappedError {
  isError: true;
  error: any;
}