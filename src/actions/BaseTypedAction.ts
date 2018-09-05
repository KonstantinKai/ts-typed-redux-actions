export interface ReducerActionArg {
  type: string;
  typedAction: BaseTypedAction;
}

export class BaseTypedAction {
  readonly type = `@@TYPED_ACTION/${(<any>this.constructor).name}`;

  toPlainObject(): ReducerActionArg {
    return {
      type: this.type,
      typedAction: this
    };
  }
}