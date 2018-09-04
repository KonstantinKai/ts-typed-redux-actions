import { BaseTypedAction } from "./actions/BaseTypedAction";

export type StateGetter<S> = () => S;

export type DispatchTypedAction = (action: BaseTypedAction) => any;

export interface WithTasksAsyncPayload<S, R> {
  onComplete?: (results: any[], dispatch: DispatchTypedAction, getState: StateGetter<S>) => R;
}