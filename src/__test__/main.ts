import { TypedAsyncActionClassFactory } from "../actions/AsyncActionClassFactory";
import { BaseTypedAction } from "../actions/BaseTypedAction";
import { isTypedAction, isWrappedError, isTypedPlainAction } from "../utils";

interface State {
  a: string;
  b: number;
}
const {
  SimpleAsyncAction,
  ParallelTasksAsyncAction,
  SeriesTasksAsyncAction
} = new TypedAsyncActionClassFactory<State>();

describe("Main", () => {
  test("Compilation", () => {
    const action1 = new SimpleAsyncAction<boolean>({
      executor: async (dispatch, getState) => {
        const state = getState();
        state.a === '';
        state.b === 1;

        dispatch(new BaseTypedAction());

        return false;
      }
    });

    const action2 = new ParallelTasksAsyncAction({
      tasks: [
        action1,
        new BaseTypedAction(),
        () => new BaseTypedAction(),
        () => false,
        (getState) => {
          const state = getState();

          state.a === '';
          state.b === 2;

          return false;
        }
      ],
      onComplete(results, dispatch, getState) {
        const state = getState();

        state.a === '';
        state.b === 2;

        dispatch(new BaseTypedAction());

        results.length === 5;

        return true;
      },
    });

    new SeriesTasksAsyncAction<string>({
      tasks: [
        action1,
        action2,
        (results, getState) => false,
        (results, getState) => {
          results.length === 0;

          const state = getState();

          state.a === '';
          state.b === 2;

          return new BaseTypedAction();
        }
      ],
      onComplete() {
        return '';
      }
    });

    const action3 = { type: '', typedAction: new BaseTypedAction() }
    const action4 = new BaseTypedAction();

    if (isTypedPlainAction(action3)) {
      action3.typedAction;
    }

    if (isTypedAction(action4)) {
      action4.toPlainObject;
    }
  });

  describe("Utils", () => {
    test("Test 1", () => {
      expect(isTypedAction(new BaseTypedAction())).toBeTruthy();
    });

    test("Test 2", () => {
      expect(isTypedPlainAction(new BaseTypedAction().toPlainObject())).toBeTruthy();
    });

    test("Test 3", () => {
      expect(isTypedAction({ type: 'Action' })).toBeFalsy();
    });

    test("Test 4", () => {
      expect(isWrappedError({ type: 'Action' })).toBeFalsy();

      expect(isWrappedError(null)).toBeFalsy();

      expect(isWrappedError(true)).toBeFalsy();

      expect(isWrappedError({ isError: true, error: '' })).toBeTruthy();
    });
  });
});