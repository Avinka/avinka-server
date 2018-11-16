import { Document, Schema} from "mongoose";
import {IDataseries} from "../dataseries/dataseries";

export interface IGraph {
    _id: any;
    name: string;
    description: string;
    createdAt:Date;
    dataseries: IDataseries[];
    mode: string;
    since: Date;
    until: Date;
    windowSize: string;
}

export class Graph implements IGraph {
    _id: any;
    name: string;
    description: string;
    createdAt:Date;
    dataseries: IDataseries[];
    until: Date;
    mode: string;
    since: Date;
    windowSize: string;

    static clone(that: IGraph): Graph {
        let result: Graph = new Graph();
        result._id = that._id;
        result.name = that.name;
        result.description = that.description;
        result.createdAt = that.createdAt;
        result.dataseries = that.dataseries;
        result.until = that.until;
        result.mode = that.mode;
        result.since = that.since;
        result.windowSize = that.windowSize;
        return result;
    }

}

export interface IGraphModel extends IGraph, Document {
}

export const GraphSchema: Schema = new Schema({
    name: String,
    description: String,
    createdAt: { type: Date, default: Date.now },
    dataseries: [{ type: Schema.Types.ObjectId, ref: 'Dataseries' }],
    until: Date,
    mode: String,
    since: Date,
    windowSize: String
});
