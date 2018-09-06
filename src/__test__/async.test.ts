import { create, SimpleAsyncAction, ParallelTasksAsyncAction, SeriesTasksAsyncAction, TimeoutAsyncAction } from "../__mocks__/reduxStore";
import { AAction, BAction, CAction, DAction, ServerAsyncAction } from "../__mocks__/actions";
import { isTypedAction, isWrappedError } from "../utils";
import axios from 'axios';

const http = require('axios/lib/adapters/http');

let ctx: any = {};

describe("Async actions", () => {
  beforeAll(() => {
    ctx.store = create();
  });

  test("Test 1", async () => {
    const { dispatch, getState } = ctx.store;

    expect(getState()).toHaveProperty('a', '');
    const res = await dispatch(new SimpleAsyncAction({
      async executor(dispatch, getState) {
        expect(getState()).toHaveProperty('a', '');
        
        dispatch(new AAction('a'))

        return false;
      }
    }));

    expect(getState()).toHaveProperty('a', 'a');
    expect(res).toBeFalsy();
  });

  test("Test 2", async () => {
    const { dispatch, getState } = ctx.store;

    expect(getState()).toHaveProperty('b', 0);
    const res = await dispatch(new ParallelTasksAsyncAction({
      tasks: [
        new BAction(1),
        (getState) => {
          expect(getState()).toHaveProperty('b', 1);

          return new SimpleAsyncAction({
            executor() {
              return new Promise((resolve) => {
                return setTimeout(() => resolve(2), 50);
              });
            }
          })
        }
      ],
      onComplete([firstAction, secondValue], dispatch, getState) {
        expect(isTypedAction(firstAction)).toBeTruthy();
        expect(secondValue).toEqual(2);

        dispatch(new BAction(secondValue));

        expect(getState()).toHaveProperty('b', 2);

        return 3;
      }
    }));

    expect(res).toEqual(3);
  });

  test("Test 3", async () => {
    const { dispatch, getState } = ctx.store;

    const res = await dispatch(new ParallelTasksAsyncAction({
      tasks: [
        new SimpleAsyncAction({
          executor(dispatch, getState) {
            const state = getState();
            return Promise.resolve(1);
          }
        }),
        new SimpleAsyncAction({
          executor() {
            return Promise.resolve(2);
          }
        }),
        new SimpleAsyncAction({
          executor() {
            return new Promise((resolve) => setTimeout(() => resolve(3), 10))
          }
        })
      ]
    }));

    expect(res).toEqual([1, 2, 3]);
  });

  test("Test 4", async () => {
    const { dispatch, getState } = ctx.store;

    const res = await dispatch(new SeriesTasksAsyncAction({
      tasks: [
        new CAction(true),
        ([fa], getState) => {
          expect(isTypedAction(fa)).toBeTruthy();

          expect(getState()).toHaveProperty('c', true);

          return new SimpleAsyncAction({
            executor() {
              return Promise.resolve(1);
            }
          })
        }
      ],
      onComplete(results, dispatch, getState) {
        expect(results).toHaveLength(2);

        dispatch(new DAction([1, 2, 3]));

        expect(getState()).toHaveProperty('d', [1, 2, 3]);

        return [results[1]];
      }
    }));

    expect(res).toEqual([1]);
  });

  test("Test 5", async () => {
    const { dispatch, getState } = ctx.store;

    const res = await dispatch(new SeriesTasksAsyncAction({
      tasks: [
        new ParallelTasksAsyncAction({
          tasks: [
            new SimpleAsyncAction({ executor: () => Promise.resolve(1) }),
            new SimpleAsyncAction({ executor: () => Promise.resolve(2) }),
            new SimpleAsyncAction({ executor: () => Promise.resolve(3) })
          ]
        }),
        new SimpleAsyncAction({ executor: () => Promise.resolve(4) }),
        new SimpleAsyncAction({ executor: () => Promise.resolve(5) })
      ]
    }));

    expect(res).toEqual([[1, 2, 3], 4, 5]);
  });

  test("Test 6", async () => {
    const { dispatch, getState } = ctx.store;

    const res = await dispatch(new SeriesTasksAsyncAction({
      tasks: [
        new ParallelTasksAsyncAction({
          tasks: [
            new SimpleAsyncAction({ executor: () => Promise.resolve(1) }),
            () => false,
            new SimpleAsyncAction({ executor: () => Promise.resolve(3) })
          ]
        }),
        () => false,
        ([nn1, sr]) => sr === false ? false : new SimpleAsyncAction({ executor: () => Promise.resolve(5) })
      ]
    }));

    expect(res).toEqual([[1, false, 3], false, false]);
  });

  test("Test 7", async () => {
    const { dispatch, getState } = ctx.store;

    const res = await dispatch(new SeriesTasksAsyncAction({
      tasks: [
        new ParallelTasksAsyncAction({
          tasks: [
            new SimpleAsyncAction({ executor: () => Promise.resolve(1) }),
            () => {
              throw 'error';
            },
            new SimpleAsyncAction({ executor: () => Promise.resolve(3) })
          ],
        }),
        () => false,
        ([nn1, sr]) => sr === false ? false : new SimpleAsyncAction({ executor: () => Promise.resolve(5) })
      ]
    }));

    expect(res).toEqual([[1, { "error": "error", "isError": true }, 3], false, false]);
  });

  test("Test 8", async () => {
    const { dispatch, getState } = ctx.store;

    const res = await dispatch(new SeriesTasksAsyncAction({
      tasks: [
        new ParallelTasksAsyncAction({
          tasks: [
            new SimpleAsyncAction({ executor: () => Promise.resolve(1) }),
            () => {
              throw 'parallel';
            },
            new SimpleAsyncAction({ executor: () => Promise.resolve(3) })
          ],
        }),
        () => {
          throw 'series';
        },
        ([nn1, sr]) => sr.isError ? false : new SimpleAsyncAction({ executor: () => Promise.resolve(5) })
      ],
    }));

    expect(res).toEqual([
      [1, { "error": "parallel", "isError": true }, 3],
      { "error": "series", "isError": true },
      false
    ]);
  });

  test("Test 9", async () => {
    const { dispatch, getState } = ctx.store;

    await dispatch(new ParallelTasksAsyncAction({
      tasks: [
        new AAction('10'),
        new BAction(10),
        new CAction(true),
        new DAction([10])
      ]
    }));

    expect(getState()).toEqual({
      a: '10',
      b: 10,
      c: true,
      d: [10]
    })
  });

  test("Test 10", async () => {
    const { dispatch, getState } = ctx.store;

    await dispatch(new ParallelTasksAsyncAction({
      tasks: [
        new SimpleAsyncAction({
          executor: async (dispatch) => new Promise((resolve) =>
            setTimeout(() => resolve(dispatch(new AAction('20'))), 50))
        }),
        new SimpleAsyncAction({
          executor: async (dispatch) => new Promise((resolve) =>
            setTimeout(() => resolve(dispatch(new BAction(20))), 50))
        }),
        new SimpleAsyncAction({
          executor: async (dispatch) => new Promise((resolve) =>
            setTimeout(() => resolve(dispatch(new CAction(false))), 50))
        }),
        new SimpleAsyncAction({
          executor: async (dispatch) => new Promise((resolve) =>
            setTimeout(() => resolve(dispatch(new DAction([20]))), 50))
        }),
      ]
    }));

    expect(getState()).toEqual({
      a: '20',
      b: 20,
      c: false,
      d: [20]
    })
  });

  test("Test 11", () => {
    const { dispatch, getState } = ctx.store;
    dispatch(new BAction(1));

    expect(getState()).toHaveProperty('b', 1);

    dispatch(new TimeoutAsyncAction({
      executor: (dispatch) => dispatch(new BAction(2)),
      timeout: 100
    }));
    expect(getState()).toHaveProperty('b', 1);

    return new Promise((resolve) => {
      setTimeout(() => {
        return resolve(true);
      }, 150);
    }).then((state) => {
      expect(getState()).toHaveProperty('b', 2);
    })
  });

  test("Test 12", () => {
    const { dispatch, getState } = ctx.store;
    dispatch(new BAction(1));

    expect(getState()).toHaveProperty('b', 1);

    const cancel = dispatch(new TimeoutAsyncAction({
      executor: (dispatch) => dispatch(new BAction(2)),
      timeout: 100
    }));
    expect(getState()).toHaveProperty('b', 1);
    
    cancel();

    return new Promise((resolve) => {
      setTimeout(() => {
        return resolve(true);
      }, 150);
    }).then((state) => {
      expect(getState()).toHaveProperty('b', 1);
    })
  });

  test("Test 13", async () => {
    const { dispatch, getState } = ctx.store;
    dispatch(new DAction([]));

    expect(getState()).toHaveProperty('d', []);

    axios.defaults.adapter = http as any;

    const res = await dispatch(new ServerAsyncAction({
      requestConfig: {
        baseURL: 'https://dog.ceo',
        url: '/api/breeds/image/random',
      },
      onStart: (getState) => {
        expect(getState()).toHaveProperty('d', []);

        return new DAction([1]);
      },
      onComplete: (result, dispatch, getState) => {
        expect(getState()).toHaveProperty('d', [1]);

        dispatch(new DAction([2]));

        expect(getState()).toHaveProperty('d', [2]);

        return result.data;
      },
      onError: (error, dispatch, getState) => {
        expect(isWrappedError(error)).toBeTruthy();
      }
    }));

    expect(res).toHaveProperty('status', 'success');
    expect(res).toHaveProperty('message');
  });

  test("Test 14", async () => {
    const { dispatch, getState } = ctx.store;

    const res = await dispatch(new ServerAsyncAction({
      requestConfig: {
        baseURL: '/',
        url: '/',
      },
      onError: (error, dispatch, getState) => {
        expect(isWrappedError(error)).toBeTruthy();
      }
    }));
  });

  test("Test 15", async () => {
    const { dispatch, getState } = ctx.store;

    const res = await dispatch(new ParallelTasksAsyncAction({
      tasks: [
        () => undefined,
        () => new AAction('test_15'),
        (getState) => {
          expect(getState()).toHaveProperty('a', 'test_15')

          return 10;
        }
      ],
      onComplete: ([f, s, t]) =>  {
        expect(f).toBeUndefined();
        expect(isTypedAction(s)).toBeTruthy();
        expect(t).toEqual(10);
      }
    }));

    expect(res[0]).toBeUndefined();
    expect(isTypedAction(res[1])).toBeTruthy();
    expect(res[2]).toEqual(10);
  });

  test("Test 16", async () => {
    const { dispatch, getState } = ctx.store;

    const res = await dispatch(new SeriesTasksAsyncAction({
      tasks: [
        () => undefined,
        ([f]) => {
          expect(f).toBeUndefined();

          return new AAction('test_16');
        },
        (nn1, getState) => {
          expect(getState()).toHaveProperty('a', 'test_16');

          throw 'third_task_error';
        }
      ],
      onComplete: ([f, s, t]) => {
        expect(f).toBeUndefined();
        expect(isTypedAction(s)).toBeTruthy();
        expect(isWrappedError(t)).toBeTruthy();
        expect(t).toHaveProperty('error', 'third_task_error');
      }
    }));

    expect(res[0]).toBeUndefined();
    expect(isTypedAction(res[1])).toBeTruthy();
    expect(isWrappedError(res[2])).toBeTruthy();
    expect(res[2]).toHaveProperty('error', 'third_task_error');
  });
});