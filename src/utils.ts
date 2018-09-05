import { BaseTypedAction } from "./actions/BaseTypedAction";
import { WrappedError } from "./types";

export const isTypedAction = (action: any) =>
  typeof action === 'object' &&
  (action instanceof BaseTypedAction ||
    'typedAction' in action && action.typedAction instanceof BaseTypedAction);

export const wrapError = (error: any): WrappedError => ({
  isError: true,
  error
});

export const isWrappedError = (error: any): error is WrappedError => error !== null &&
  typeof error === 'object' && error.isError === true &&
  'error' in error;