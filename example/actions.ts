import { AsyncAction, SeriesTasksAsyncAction, SimpleAsyncAction, ParallelTasksAsyncAction } from "./baseActions";
import {
  DispatchTypedAction,
  StateGetter,
  StringAction,
  NumberAction,
  BooleanAction,
  ArrayAction,
  TypedAction,
  BaseTypedAction
} from "ts-typed-redux-actions";
import { SimpleState } from "./storeShape";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { isWrappedError } from "ts-typed-redux-actions/src/utils";

export class AAction extends StringAction { }

export class BAction extends NumberAction { }

export class CAction extends BooleanAction { }

export class DAction extends ArrayAction<number> { }

export class FAction extends TypedAction<SimpleState> { }

export class EAction extends TypedAction { }

interface ServerAsyncActionPayload {
  requestConfig: AxiosRequestConfig;
  onStart?: (getState: StateGetter<SimpleState>) => (BaseTypedAction | false);
  onComplete?: (results: AxiosResponse, dispatch: DispatchTypedAction, getState: StateGetter<SimpleState>) => any;
  onError?: (error: any, dispatch: DispatchTypedAction, getState: StateGetter<SimpleState>) => any;
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
          false,
        ([fTask]) => fTask !== false && new SimpleAsyncAction({
          executor: () => axios.request({
            ...requestConfig,
            baseURL: getState().a
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

export const makeSomeServerRequest = () => new ServerAsyncAction({
  requestConfig: {
    url: 'api/',
    params: {
      param1: 'value'
    },
    headers: {
      'auth-token': 'token'
    }
  },
  onStart: () => new CAction(true),
  onComplete: (response, dispatch, getState) => {
    dispatch(new DAction(response.data as number[]));
  },
  onError: (error, dispatch) => {
    dispatch(new EAction(error)/* some error action */);
  }
});

export const multipleParallelServerRequests = () => new ParallelTasksAsyncAction({
  tasks: [
    makeSomeServerRequest(),
    makeSomeServerRequest(),
    makeSomeServerRequest()
  ],
  onComplete: ([result1, result2, result3], dispatch, getState) => {

  }
});

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