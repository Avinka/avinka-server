import {Request, Response} from "express";
import {DataPointQuery} from "./datapointQuery";
import {DataPointModel} from "./datapointModel";

export class DatapointRouter {

    readonly  model: DataPointModel;

    constructor(model: DataPointModel) {
        this.model = model;
    }

    public routes(app): void {
        app.route('/datapoints/')
            .get(async (req: Request, res: Response) => {
                let query = new DataPointQuery();
                if (req.query.since) {
                    query.since = new Date(decodeURIComponent(req.query.since));
                }
                if (req.query.until) {
                    query.until = new Date(decodeURIComponent(req.query.until));
                }
                query.dataseriesIds = req.query.dataseriesIds.split(',');

                const result = await this.model.getDataPoints(query);

                if(result) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send();
                }
            });
    }
}
