import { BaseTypedAction } from "./actions/BaseTypedAction";

export const isTypedAction = (action: any) =>
  typeof action === 'object' &&
  (action instanceof BaseTypedAction ||
    'typedAction' in action && action.typedAction instanceof BaseTypedAction);

export const wrapError = (error: any) => ({
  isError: true,
  error
});

export const isWrappedError = (error: any) => error !== null &&
  typeof error === 'object' && error.isError === true &&
  'error' in error;