import {Request, Response} from "express";
import * as mongoose from "mongoose";
import {DataseriesSchema, IDataseries, IDataseriesModel} from "./dataseries";
import {Model} from "mongoose";
import {DataseriesService} from "./dataseriesService";

export class DataseriesRouter {

    readonly Dataseries: Model<IDataseriesModel> = mongoose.model<IDataseriesModel>('Dataseries', DataseriesSchema);
    readonly dataseriesService: DataseriesService;

    constructor(dataseriesService: DataseriesService) {
        this.dataseriesService = dataseriesService;
    }

    public routes(app): void {
        app.route('/dataseries')
            .get(async (req: Request, res: Response) => {
                let result = await this.Dataseries.find().exec();
                res.status(200).send(result)
            })
            .post(async (req: Request, res: Response) => {
                let result = await this.Dataseries.create(req.body);
                res.status(200).send(result)
            });
        app.route('/dataseries/:id')
            .get(async (req: Request, res: Response) => {
                const id = req.params.id;
                const result: IDataseries = await this.Dataseries.findOne({_id: id}).exec();
                if(result != null) {
                    res.status(200).send(result)
                } else {
                    res.status(404)
                }
            })
            .delete(async (req: Request, res: Response) => {
                const id = req.params.id;
                let result = await this.Dataseries.deleteOne({_id: id}).exec();
                res.status(200).send(result)
            })
            .put(async (req: Request, res: Response) => {
                const id = req.params.id;
                let result = await this.Dataseries.updateOne({_id: id}, req.body).exec();
                res.status(200).send(result)
            });
        app.route('/dataseries/:id/selectors')
            .post(async (req: Request, res: Response) => {
                const dataseriesId = req.params.id;
                let result = await this.Dataseries.findOne({_id: dataseriesId});
                // @ts-ignore
                result.selectors.push(req.body._id);
                await result.save();
                res.status(200).send(result);
            });
    }
}
