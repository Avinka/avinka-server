import {Document, Schema} from "mongoose";
import {ISelector} from "../query/selector";

export interface IDataseries {
    _id: any;
    name: string;
    createdAt: Date;
    indexName: string;
    selectors: ISelector[];
}

export class Dataseries implements IDataseries {
    _id: any;
    name: string;
    createdAt: Date;
    indexName: string;
    selectors: ISelector[];

    static clone(that: IDataseries): Dataseries {
        let result: Dataseries = new Dataseries();
        result._id = that._id;
        result.name = that.name;
        result.createdAt = that.createdAt;
        result.indexName = that.indexName;
        result.selectors = that.selectors;
        return result;
    }
}

export interface IDataseriesModel extends IDataseries, Document {
}

export const DataseriesSchema: Schema = new Schema({
    name: String,
    createdAt: {type: Date, default: Date.now},
    query: String,
    indexName: String,
    selectors: [{type: Schema.Types.ObjectId, ref: 'Selector'}]
    // aggregators: [{ type: Schema.Types.ObjectId, ref: 'Aggregator' }]
});
