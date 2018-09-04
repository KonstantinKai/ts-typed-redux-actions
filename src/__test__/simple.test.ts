import { create } from "../__mocks__/reduxStore";
import { FAction } from "../__mocks__/actions";

let ctx: any = {};

describe("Simple", () => {
  beforeAll(() => {
    ctx.store = create();
  });

  test("Test 1", () => {
    const { dispatch, getState } = ctx.store;

    const payload = {
      a: '10',
      b: 10,
      c: true,
      d: [10]
    };
    dispatch(new FAction(payload));

    expect(getState()).toEqual(payload);
  });
});