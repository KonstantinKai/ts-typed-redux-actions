import { BaseTypedAction } from "./BaseTypedAction";
import { GenericPayloadAction } from "./GenericPayloadAction";

export class EmptyAction extends BaseTypedAction { }

export class BooleanAction extends GenericPayloadAction<boolean> { }

export class StringAction extends GenericPayloadAction<string> { }

export class NumberAction extends GenericPayloadAction<number> { }

export class NullAction extends GenericPayloadAction<null> { }

export class ArrayAction<T = any> extends GenericPayloadAction<T[]> { }

export class TypedAction<T = any> extends GenericPayloadAction<T> { }