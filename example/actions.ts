import { AsyncAction, DispatchTypedAction } from "ts-typed-redux-action";
import { SimpleState } from "./typedActionBootstrap";
import { StateGetter } from "ts-typed-redux-action/src/types";

export class ServerAsyncAction extends AsyncAction<any, SimpleState> {
  execute(dispatch: DispatchTypedAction, getState: StateGetter<SimpleState>) {
    const state = getState();
  }
}