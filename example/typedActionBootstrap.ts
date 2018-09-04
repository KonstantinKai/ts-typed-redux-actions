import { TypedAsyncActionClassFactory } from 'ts-typed-redux-action';

export interface SimpleState {
  a: string;
}

const {
  AsyncAction
} = new TypedAsyncActionClassFactory<SimpleState>();

export {
  AsyncAction
};