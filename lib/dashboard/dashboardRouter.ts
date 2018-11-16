import {Request, Response} from "express";
import * as mongoose from "mongoose";
import {DashboardSchema, IDashboardModel} from "./dashboard";
import {Model} from "mongoose";
import {ObjectId} from "bson";
import {body, check, param, validationResult, ValidatorOptions} from 'express-validator/check';
import {Client} from "elasticsearch";


export class DashboardRouter {

    readonly Dashboard: Model<IDashboardModel> = mongoose.model<IDashboardModel>('Dashboard', DashboardSchema);

    constructor(model: Model<IDashboardModel>) {
        this.Dashboard = model;
    }

    public routes(app): void {
        app.route('/dashboard')
            .get(async (req: Request, res: Response) => {
                let result = await this.Dashboard.find().exec();
                res.status(200).send(result)
            })
            .post(async (req: Request, res: Response) => {
                // TODO add validation
                let result = await this.Dashboard.create(req.body);
                res.status(201).send(result)
            });
        app.route('/dashboard/:id')
            .get(async (req: Request, res: Response) => {
                const id = req.params.id;
                try {
                    let findOne = this.Dashboard.findOne({_id: id});
                    if (req.query.full === 'true') {
                        findOne = findOne.populate('graphs')
                    }
                    let result = await findOne.exec();
                    if (!result) {
                        res.status(404).send();
                        return;
                    }
                    res.status(200).send(result)
                } catch (err) {
                    // TODO check if it is a server error or mal formed id
                    res.status(400).send()
                }

            })
            .delete(async (req: Request, res: Response) => {
                const id = req.params.id;
                let result = await this.Dashboard.deleteOne({_id: id}).exec();
                res.status(200).send(result)
            })
            .put(async (req: Request, res: Response) => {
                const id = req.params.id;
                await this.Dashboard.update({_id: id}, req.body).exec();
                let result = await this.Dashboard.findById(id).exec();
                res.status(200).send(result)
            });
        app.route('/dashboard/:id/graph')
            .post([
                body('graphId').exists(),
                param('id').exists()
            ], async (req: Request, res: Response) => {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(422).json({errors: errors.array()});
                }
                // TODO add validation
                const dashboardId = req.params.id;
                let result = await this.Dashboard.findOne({_id: dashboardId});
                // @ts-ignore
                result.graphs.push(req.body.graphId);
                await result.save();
                res.status(201).send(result)
            })
            .get(async (req: Request, res: Response) => {
                const id = req.params.id;
                let result = await this.Dashboard.findOne({_id: id})
                    .populate({
                        path: 'graphs',
                        populate: {
                            path: 'dataseries',
                            model: 'Dataseries',
                            populate: {
                                path: 'selectors',
                                model: 'Selector'
                            }
                        }
                    }).exec();
                // @ts-ignore
                res.status(200).send(result.graphs)
            });
        app.route('/dashboard/:id/graph/:graphId')
            .delete(async (req: Request, res: Response) => {
                // TODO add validation
                const dashboardId = req.params.id;
                const graphId = req.params.graphId;
                this.Dashboard.findOneAndUpdate(dashboardId,
                    {$pull: {graphs: new ObjectId(graphId)}},
                    {upsert: true},
                    function (err, doc) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.status(201).send()
                        }
                    }
                );
            })


    }
}
