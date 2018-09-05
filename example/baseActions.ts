import {
  TypedAsyncActionClassFactory,
} from "ts-typed-redux-actions";
import { SimpleState } from "./storeShape";

const {
  AsyncAction,
  SimpleAsyncAction,
  TimeoutAsyncAction,
  ParallelTasksAsyncAction,
  SeriesTasksAsyncAction
} = new TypedAsyncActionClassFactory<SimpleState>();

export {
  AsyncAction,
  TimeoutAsyncAction,
  ParallelTasksAsyncAction,
  SeriesTasksAsyncAction,
  SimpleAsyncAction
};

export {
  StringAction,
  BooleanAction,
  NullAction,
  NumberAction,
  ArrayAction,
  TypedAction,
  EmptyAction
} from "ts-typed-redux-actions";