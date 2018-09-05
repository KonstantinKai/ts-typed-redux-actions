import { GenericPayloadAction } from "../actions/GenericPayloadAction";
import { SimpleState, SeriesTasksAsyncAction, SimpleAsyncAction } from "./reduxStore";
import { StateGetter, DispatchTypedAction, WrappedError } from "../types";
import { BaseTypedAction } from "../actions/BaseTypedAction";
import { AsyncAction } from "../actions/AsyncAction";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { isWrappedError } from "../utils";
import { EmptyAction } from '../actions/PrimitiveActions';

export class AAction extends GenericPayloadAction<string> { }

export class BAction extends GenericPayloadAction<number> { }

export class CAction extends GenericPayloadAction<boolean> { }

export class DAction extends GenericPayloadAction<number[]> { }

export class FAction extends GenericPayloadAction<SimpleState> { }

interface ServerAsyncActionPayload {
  requestConfig: AxiosRequestConfig;
  onStart?: (getState: StateGetter<SimpleState>) => (BaseTypedAction | false);
  onComplete?: (result: AxiosResponse, dispatch: DispatchTypedAction, getState: StateGetter<SimpleState>) => any;
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