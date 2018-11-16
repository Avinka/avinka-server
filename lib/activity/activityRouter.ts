import {Request, Response} from "express";
import {ActivityService} from "./activityService";
import {Result} from "../util/result";

export class ActivityRouter {

    readonly activityService: ActivityService;

    constructor(activityService: ActivityService) {
        this.activityService = activityService;
    }

    public routes(app): void {
        app.route('/activity')
            .get(async (req: Request, res: Response) => {
                try {
                    let result = await this.activityService.get(req.body);
                    res.status(200).send(new Result(result));
                } catch (err) {
                    res.status(400).send(err.toString());
                }
            })
            .post(async (req: Request, res: Response) => {
                try {
                    let result = await this.activityService.create(req.body);
                    res.status(201).send(result)
                } catch (err) {
                    res.status(400).send(err.toString());
                }
            });
        app.route('/activity/key-value-options')
            .get(async (req: Request, res: Response) => {
                const keyValueOptions = await this.activityService.getKeyValueOptions();
                res.status(200).send(keyValueOptions);
            });
    }
}
