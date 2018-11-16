import {Request, Response} from "express";
import {ActivityService} from "../activity/activityService";

export class AdminRouter {

    readonly activityService: ActivityService;

    constructor(activityService: ActivityService) {
        this.activityService = activityService;
    }

    public routes(app): void {
        app.route('/admin/deleteIndex')
            .get(async (req: Request, res: Response) => {
                this.activityService.client.indices.delete({
                    index: this.activityService.indexName
                });
                res.status(200).send()
            });
        app.route('/admin/generateData')
            .get(async (req: Request, res: Response) => {
                this.activityService.generateData();
                res.status(200).send()
            });
        app.route('/admin/deleteData')
            .get(async (req: Request, res: Response) => {
                await this.activityService.deleteData();
                res.status(200).send()
            })
    }
}
