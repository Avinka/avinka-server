import {Request, Response} from "express";
import * as mongoose from "mongoose";
import {Selector, SelectorSchema, ISelector, ISelectorModel} from "./selector";
import {Model} from "mongoose";

export class SelectorRouter {

    readonly Selector: Model<ISelectorModel> = mongoose.model<ISelectorModel>('Selector', SelectorSchema);

    public routes(app): void {
        app.route('/selector')
            .get(async (req: Request, res: Response) => {
                let result = await this.Selector.find().exec();
                res.status(200).send(result)
            })
            .post(async (req: Request, res: Response) => {
                let result = await this.Selector.create(req.body);
                res.status(200).send(result)
            });
        app.route('/selector/:id')
            .get(async (req: Request, res: Response) => {
                const id = req.params.id;
                let result: ISelector = await this.Selector.findOne({_id: id}).exec();
                res.status(200).send(result)
            })
            .delete(async (req: Request, res: Response) => {
                const id = req.params.id;
                let result = await this.Selector.deleteOne({_id: id}).exec();
                res.status(200).send(result)
            })
            .put(async (req: Request, res: Response) => {
                const id = req.params.id;
                let result = await this.Selector.updateOne({_id: id}, req.body).exec();
                res.status(200).send(result)
            });
    }
}
