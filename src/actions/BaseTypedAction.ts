export class BaseTypedAction {
  readonly type = `@@TYPED_ACTION/${(<any>this.constructor).name}`;

  toPlainObject() {
    return {
      type: this.type,
      typedAction: this as BaseTypedAction
    };
  }
}