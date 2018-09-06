import { isTypedAction, isTypedPlainAction } from "./utils";
import { BaseTypedAction } from "./actions/BaseTypedAction";
import { Middleware } from 'redux';
import { AsyncAction } from "./actions/AsyncAction";

export const typedActionMiddleware: Middleware = () => (next) => (action) => {
  if (isTypedAction(action)) {
    return next((action as BaseTypedAction).toPlainObject());
  }

  return next(action);
};

export const asyncTypedActionMiddleware: Middleware = ({ dispatch, getState }) => (next) => (action) => {
  if (isTypedPlainAction(action)) {
    const typedAction = action.typedAction;

    if (typedAction instanceof AsyncAction) {
      return typedAction.execute(dispatch, getState);
    }
  }

  return next(action);
};

export const typedActionMiddlewares = [
  typedActionMiddleware,
  asyncTypedActionMiddleware
];