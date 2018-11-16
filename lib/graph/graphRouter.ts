import {Request, Response} from "express";
import * as mongoose from "mongoose";
import {Graph, GraphSchema, IGraphModel} from "./graph";
import {Model} from "mongoose";
import {DataseriesSchema, IDataseries, IDataseriesModel} from "../dataseries/dataseries";
import {DatapointService} from "../datapoint/datapointService";
import {ObjectId} from "bson";

export class GraphRouter {

    readonly Graph: Model<IGraphModel> = mongoose.model<IGraphModel>('Graph', GraphSchema);
    readonly Dataseries: Model<IDataseriesModel> = mongoose.model<IDataseriesModel>('Dataseries', DataseriesSchema);
    readonly datapointService: DatapointService;

    constructor(dataseriesService: DatapointService) {
        this.datapointService = dataseriesService;
    }

    public routes(app): void {
        app.route('/graph')
            .get(async (req: Request, res: Response) => {
                let graph = await this.Graph.find().populate({
                    path: 'dataseries',
                    model: 'Dataseries',
                    populate: {
                        path: 'selectors',
                        model: 'Selector'
                    }
                }).exec();
                res.status(200).send(graph)
            })
            .post(async (req: Request, res: Response) => {
                let graph: Graph = req.body;
                let dataseries: IDataseries = await this.Dataseries.create({});
                graph.dataseries = [dataseries];
                let result = await this.Graph.create(graph);
                //Only the id of the dataseries is persisted, therefore we need to add it again
                result.dataseries = [dataseries];
                res.status(201).send(result)
            });
        app.route('/graph/:id')
            .patch(async (req: Request, res: Response) => {
                const id = req.params.id;
                await this.Graph.update({_id: id}, {'$set': req.body}).exec();
                let result = await this.Graph.findById(id).exec();
                res.status(200).send(result);
            })
            .get(async (req: Request, res: Response) => {
                if (!req.params.id.includes(',')) {
                    try {
                        const graph = await this.Graph.findOne({_id: req.params.id}).populate({
                            path: 'dataseries',
                            model: 'Dataseries',
                            populate: {
                                path: 'selectors',
                                model: 'Selector'
                            }
                        }).exec();
                        if (graph != null) {
                            res.status(200).send(graph);
                        } else {
                            res.status(404).send()
                        }
                    } catch (err) {
                        // TODO check if server error or invalid id
                        res.status(400).send()
                    }
                } else {
                    try {
                        let result = await this.Graph.find({_id: {$in: req.params.id.split(',')}})
                            .populate({
                                path: 'dataseries',
                                model: 'Dataseries',
                                populate: {
                                    path: 'selectors',
                                    model: 'Selector'
                                }
                            }).exec();
                        res.status(200).send(result)
                    } catch (err) {
                        // TODO check if server error or invalid id
                        res.status(400).send()
                    }
                }
            })
            .delete(async (req: Request, res: Response) => {
                const graph = await this.Graph.findOne({_id: req.params.id}).exec();
                if (graph.dataseries) {
                    await this.Dataseries.deleteMany({_id: {$in: graph.dataseries}});
                }
                await graph.remove();
                res.status(200).send();
            })
            .put(async (req: Request, res: Response) => {
                const id = req.params.id;
                await this.Graph.update({_id: id}, req.body).exec();
                let result = await this.Graph.findById(id).exec();
                res.status(200).send(result);
            });
        app.route('/graph/:id/dataseries')
            .post(async (req: Request, res: Response) => {
                // TODO add validation
                const graphId = req.params.id;
                let result = await this.Graph.findOne({_id: graphId});
                // @ts-ignore
                result.dataseries.push(req.body._id);
                await result.save();
                res.status(201).send(result)
            });
        app.route('/graph/:id/dataseries/:dataseriesId')
            .delete(async (req: Request, res: Response) => {
                const graphId = req.params.id;
                const dataseriesId = req.params.dataseriesId;
                this.Graph.findOneAndUpdate(graphId,
                    {$pull: {dataseries: new ObjectId(dataseriesId)}},
                    {upsert: true},
                    function (err, doc) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.status(200).send()
                        }
                    }
                );
            });
    }
}
