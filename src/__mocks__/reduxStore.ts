import { createStore, Reducer, applyMiddleware } from "redux";
import { typedActionMiddlewares } from "../middlewares";
import { TypedAsyncActionClassFactory } from "../actions/AsyncActionClassFactory";
import { AAction, BAction, CAction, DAction, FAction } from "./actions";

export interface SimpleState {
  a: string;
  b: number;
  c: boolean;
  d: number[];
}

const initialState: SimpleState = {
  a: '',
  b: 0,
  c: false,
  d: [1, 2, 3]
};

const reducer: Reducer<SimpleState> = (
  state = initialState,
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

const create = () => createStore(
  reducer,
  applyMiddleware(...typedActionMiddlewares)
);

const {
  SimpleAsyncAction,
  ParallelTasksAsyncAction,
  SeriesTasksAsyncAction,
  TimeoutAsyncAction
} = new TypedAsyncActionClassFactory<SimpleState>();

export {
  create,
  SimpleAsyncAction,
  ParallelTasksAsyncAction,
  SeriesTasksAsyncAction,
  TimeoutAsyncAction
};