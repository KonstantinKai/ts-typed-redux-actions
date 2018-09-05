# How to use
## Describe your redux store shape
```ts
// storeShape.ts
export interface SimpleState {
  a: string;
  b: number;
  c: boolean;
  d: number[];
}
```

## Create module with base actions:
`TypedAsyncActionClassFactory<S>` is needed to pass down `store shape` to all async actions 
```ts
// baseActions.ts
import {
  TypedAsyncActionClassFactory,
} from "ts-typed-redux-actions";
import { SimpleState } from "./storeShape";

const {
  AsyncAction,
  TimeoutAsyncAction,
  SimpleAsyncAction,
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
```

## Write your project actions
```ts
// actions.ts
import {
  StringAction,
  NumberAction,
  BooleanAction,
  ArrayAction,
  TypedAction
} from "./baseActions";
import { SimpleState } from "./storeShape";

export class AAction extends StringAction { }

export class BAction extends NumberAction { }

export class CAction extends BooleanAction { }

export class DAction extends ArrayAction<number> { }

export class FAction extends TypedAction<SimpleState> { }
```
You can use predefined primitive actions or define your own, just extend `GenericPayloadAction<T>` class with a generic type, e.g:
```ts
import { GenericPayloadAction } from "ts-typed-redux-actions";

type MyType = { prop1: string; prop2: number };
export class YourAction extends GenericPayloadAction<MyType> { }
```
Note: `TypedAction<T>` class is a short version of `GenericPayloadAction<T>` class, so you are free to using him.
## Let's describe our reducer logic
```ts
// reducer.ts
import { Reducer } from "redux";
import { SimpleState } from "./storeShape";
import { AAction, BAction, CAction, DAction, FAction } from "./actions";

export const reducer: Reducer<SimpleState> = (
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
```
This library brings an ability to test actions in OOP way, instead of string comparison `action.type === 'SOME_ACTION'` 

## And finally, create redux store
```ts
// store.ts
import { createStore, applyMiddleware } from "redux";
import { reducer } from "./reducer";
import { typedActionMiddlewares } from "ts-typed-redux-actions";

export const store = createStore(
  reducer,
  applyMiddleware(...typedActionMiddlewares)
);
```
## Tips
How about server requests? Yeah, sure. For this case we took [axios](https://www.npmjs.com/package/axios) library, but you can use another libraries like [fetch](https://github.github.io/fetch/) polyfill or `XMLHttpRequest`.
The following approach allows you, for example, change baseUrl server in runtime if they stored in redux store, pass authentication token to server from store.
```ts
// actions.ts
import { isWrappedError } from "ts-typed-redux-actions";
import { SimpleAsyncAction, EmptyAction } from "./baseActions";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { WrappedError } from "../types";

interface ServerAsyncActionPayload {
  requestConfig: AxiosRequestConfig;
  onStart?: (getState: StateGetter<SimpleState>) => (BaseTypedAction | false);
  onComplete?: (results: [any, AxiosResponse], dispatch: DispatchTypedAction, getState: StateGetter<SimpleState>) => any;
  onError?: (error: WrappedError, dispatch: DispatchTypedAction, getState: StateGetter<SimpleState>) => any;
}
export class ServerAsyncAction extends AsyncAction<ServerAsyncActionPayload, SimpleState> {
  execute(dispatch: DispatchTypedAction, getState: StateGetter<SimpleState>) {
    const {
      onStart,
      onComplete,
      onError,
      requestConfig
    } = this.payload;

    return dispatch(new SeriesTasksAsyncAction({
      tasks: [
        () => typeof onStart === 'function' ?
          onStart(getState) :
          new EmptyAction(),
        ([fTask]) => fTask !== false && new SimpleAsyncAction({
          executor: () => axios.request({
            ...requestConfig,
            baseURL: getState().a,
            headers: {
              'auth-token': getState().tokenProperty
            }
          })
        }),
      ],
      onComplete([nn1, response]) {
        if (isWrappedError(response) && typeof onError === 'function') {
          return onError(response, dispatch, getState);
        }

        if (typeof onComplete === 'function') {
          const onCompleteResult = onComplete(response, dispatch, getState);

          if (typeof onCompleteResult !== 'undefined') {
            return onCompleteResult;
          }
        }

        return response;
      }
    }));
  }
};
```
### And use this action in project
```ts
// ...
// in actions
// ...
export const makeSomeServerRequest = (params) => new ServerAsyncAction({
  requestConfig: {
    url: 'api/',
    params,
  },
  onStart: () => new CAction(true),
  onComplete: (response, dispatch, getState) => {
    dispatch(new DAction(response.data as number[]));
  },
  onError: (error, dispatch) => {
    dispatch(new EAction(error)/* some error action */);
  }
});

// ...
// connect mapDispatchToProps
// ...

const mapDispaToProps = (dispatch) => ({
  // ...
  makeRequest: (...args) => dispatch(makeSomeServerRequest(...args)),
  // ...
})
```

### Paraller miltiple server requests
```ts
export const multipleParallelServerRequests = () => new ParallelTasksAsyncAction({
  tasks: [
    makeSomeServerRequest(),
    makeSomeServerRequest(),
    makeSomeServerRequest()
  ],
  onComplete: ([result1, result2, result3], dispatch, getState) => {

  }
});
```

### Make series several requests which depend on previous results
```ts
export const seriesServerRequets = () => new SeriesTasksAsyncAction({
  tasks: [
    multipleParallelServerRequests(),
    makeSomeServerRequest(),
    ([[result1, result2, result3], secTask]) => {
      if (isWrappedError(result2)) {
        return false;
      }

      return makeSomeServerRequest();
    }
  ],
  onComplete: (
    [[result1, result2, result3], secTask, thirdTask],
    dispatch,
    getState
  ) => {

  }
});
```

### Make some async operation, for exampe `ReactNative.Alert.alert`
```ts
import { Alert } from 'react-native'

const alertAction = new SimpleAsyncAction({
  executor: (dispatch) => new Promise((resolve) => {
    Alert.alert(
      'Title',
      'message',
      [
        {
          text: 'No', style: 'cancel', onPress: () => resolve(false);
        },
        {
          text: 'Yes', style: 'cancel', onPress: () => resolve(true);
        }
      ]
    )
  });
});
```

### Make timeout action
```ts
import { TimeoutAsyncAction } from "./baseActions";

export const timeoutAction = (timeout = 2 * 1000) => new TimeoutAsyncAction({
  timeout,
  executor: (dispatch, getState) => dispatch(new AAction('string')) 
})
```
### You can cancel previous timeout action
```ts
const cancelTimeoutAction = dispatch(timeoutAction());

cancelTimeoutAction();
```
___

This library can be a full replacement for such middlewares like `redux-thunk, redux-promise, etc.`

And now you have strong typed redux actions which help you create stable projects with Typescript.