import { GenericPayloadAction } from "../actions/GenericPayloadAction";
import { SimpleState } from "./reduxStore";

export class AAction extends GenericPayloadAction<string> { }

export class BAction extends GenericPayloadAction<number> { }

export class CAction extends GenericPayloadAction<boolean> { }

export class DAction extends GenericPayloadAction<number[]> { }

export class FAction extends GenericPayloadAction<SimpleState> { }