import {Document, Schema, Model, model} from "mongoose";

export interface ISelector {
    key: string;
    value: string;
    operator: string;
    createdAt?: Date;
}

export class Selector implements ISelector {
    key: string;
    value: string;
    operator: string;
    createdAt?: Date;

    constructor(key: string, value: string, operator: string, createdAt?: Date) {
        this.key = key;
        this.value = value;
        this.operator = operator;
        this.createdAt = createdAt;
    }
    static clone(that: ISelector): Selector {
        return new Selector(that.key, that.value, that.operator, that.createdAt);
    }
}

export interface ISelectorModel extends ISelector, Document {
}

export const SelectorSchema: Schema = new Schema({
    key: String,
    value: String,
    operator: String,
    createdAt: {type: Date, default: Date.now}
});
