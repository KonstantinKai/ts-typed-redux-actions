import { GenericPayloadAction } from "./GenericPayloadAction";
import { DispatchTypedAction, StateGetter } from "../types";

export abstract class AsyncAction<T, S> extends GenericPayloadAction<T> {
  abstract execute(dispatch: DispatchTypedAction, getState: StateGetter<S>): any;
}
