import {Request, Response} from "express";
import * as mongoose from "mongoose";
import {DataseriesSchema, IDataseries, Dataseries, IDataseriesModel} from "./dataseries";
import {Model} from "mongoose";
import {GraphSchema, IGraphModel} from "../graph/graph";
import {ObjectId} from "bson";

export class DataseriesRouter {

    readonly Graph: Model<IGraphModel> = mongoose.model<IGraphModel>('Graph', GraphSchema);
    readonly Dataseries: Model<IDataseriesModel> = mongoose.model<IDataseriesModel>('Dataseries', DataseriesSchema);

    public routes(app): void {
        app.route('/dataseries')
            .get(async (req: Request, res: Response) => {
                let result = await this.Dataseries.find().populate('selectors').exec();
                res.status(200).send(result);
            })
            .post(async (req: Request, res: Response) => {
                let result = await this.Dataseries.create(req.body);
                res.status(201).send(result);
            });
        app.route('/dataseries/:id')
            .get(async (req: Request, res: Response) => {
                try {
                    const id = req.params.id;
                    const result: IDataseries = await this.Dataseries.findOne({_id: id}).populate('selectors').exec();
                    if (result != null) {
                        res.status(200).send(result);
                    } else {
                        res.status(404).send();
                    }
                } catch (err) {
                    // TODO check if server error or invalid id
                    res.status(400).send()
                }
            })
            .delete(async (req: Request, res: Response) => {
                const id = req.params.id;
                let result = await this.Dataseries.deleteOne({_id: id}).exec();
                res.status(200).send(result);
            })
            .put(async (req: Request, res: Response) => {
                const id = req.params.id;
                await this.Dataseries.updateOne({_id: id}, req.body).exec();
                const result = await this.Dataseries.findById(id).populate('selectors').exec();
                res.status(200).send(result);
            });
        app.route('/dataseries/:id/selector')
            .post(async (req: Request, res: Response) => {
                const dataseriesId = req.params.id;
                let result = await this.Dataseries.findOne({_id: dataseriesId});
                // @ts-ignore
                result.selectors.push(req.body._id);
                await result.save();
                result = await this.Dataseries.findOne({_id: dataseriesId}).populate('selectors').exec();
                res.status(200).send(result.selectors);
            });

        app.route('/dataseries/:id/selector/:selectorId')
            .delete(async (req: Request, res: Response) => {
                const dataseriesId = req.params.id;
                const selectorId = req.params.selectorId;
                this.Dataseries.findOneAndUpdate(dataseriesId,
                    {$pull: {selectors: new ObjectId(selectorId)}},
                    {upsert: true},
                    function(err, doc) {
                        if(err){
                            console.log(err);
                        }else{
                            res.status(200).send()
                        }
                    }
                );
            });
    }
}
