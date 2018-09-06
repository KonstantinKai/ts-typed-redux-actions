import { SimpleState } from "./storeShape";
import { AAction, BAction, CAction, DAction, FAction } from "./actions";
import { ReducerTypedAction } from "ts-typed-redux-actions";

export const reducer: ReducerTypedAction<SimpleState> = (
  state = {
    a: '',
    b: 0,
    c: false,
    d: []
  },
  { typedAction }
) => {
  if (typedAction instanceof AAction) {
    return {
      ...state,
      a: typedAction.payload
    };
  } else if (typedAction instanceof BAction) {
    return {
      ...state,
      b: typedAction.payload
    };
  } else if (typedAction instanceof CAction) {
    return {
      ...state,
      c: typedAction.payload
    };
  } else if (typedAction instanceof DAction) {
    return {
      ...state,
      d: typedAction.payload
    };
  } else if (typedAction instanceof FAction) {
    return typedAction.payload;
  }

  return state;
}