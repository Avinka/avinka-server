import { Document, Schema, Model, model} from "mongoose";
import {IGraph} from "../graph/graph";

export interface IDashboard {
    name: string;
    createdAt: Date;
    graphs: IGraph[];
}

export interface IDashboardModel extends IDashboard, Document {
}

export const DashboardSchema: Schema = new Schema({
    name: String,
    createdAt: { type: Date, default: Date.now },
    graphs: [{ type: Schema.Types.ObjectId, ref: 'Graph' }]
});
