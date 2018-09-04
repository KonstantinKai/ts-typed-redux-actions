import { getSimpleAsyncActionClass } from "./SimpleAsyncAction";
import { getTimeoutAsyncActionClass } from "./TimeoutAsyncAction";
import { getParallelTasksAsyncActionClass } from "./ParallelTasksAsyncAction";
import { getSeriesTasksAsyncActionClass } from "./SeriesTasksAsyncAction";
import { AsyncAction } from "./AsyncAction";

export class TypedAsyncActionClassFactory<S> {
  AsyncAction = AsyncAction;

  SimpleAsyncAction = class SimpleAsyncAction<R = any> extends getSimpleAsyncActionClass()<S, R> { };

  ParallelTasksAsyncAction = class ParallelTasksAsyncAction<R = any[]> extends getParallelTasksAsyncActionClass()<S, R> { };

  SeriesTasksAsyncAction = class SeriesTasksAsyncAction<R = any[]> extends getSeriesTasksAsyncActionClass()<S, R> { };

  TimeoutAsyncAction = class TimeoutAsyncAction extends getTimeoutAsyncActionClass()<S> { }
}