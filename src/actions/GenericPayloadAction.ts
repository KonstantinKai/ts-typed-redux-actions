import { BaseTypedAction } from "./BaseTypedAction";

export class GenericPayloadAction<T> extends BaseTypedAction {
  readonly payload: T;

  constructor(payload: T) {
    super();

    this.payload = payload;
  }
}