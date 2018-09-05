import { createStore, applyMiddleware } from "redux";
import { reducer } from "./reducer";
import { typedActionMiddlewares } from "ts-typed-redux-actions";

export const store = createStore(
  reducer,
  applyMiddleware(...typedActionMiddlewares)
);