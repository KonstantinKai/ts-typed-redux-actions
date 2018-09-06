import { BaseTypedAction, ReducerActionArg } from "./actions/BaseTypedAction";
import { WrappedError } from "./types";

export const isTypedPlainAction = (action: any): action is ReducerActionArg =>
  action !== null &&
  typeof action === 'object' &&
  'typedAction' in action && action.typedAction instanceof BaseTypedAction;

export const isTypedAction = (action: any): action is BaseTypedAction =>
  action !== null &&
  typeof action === 'object' &&
  action instanceof BaseTypedAction;

export const wrapError = (error: any): WrappedError => ({
  isError: true,
  error
});

export const isWrappedError = (error: any): error is WrappedError => error !== null &&
  typeof error === 'object' && error.isError === true &&
  'error' in error;