import {DataseriesSchema, IDataseries, IDataseriesModel} from "../dataseries/dataseries";
import {DataPoints} from "./datapoints";
import {DataPointQuery} from "./datapointQuery";
import {DatapointService} from "./datapointService";
import {Model} from "mongoose";
import * as mongoose from "mongoose";

export class DataPointModel {

    readonly dataPointService: DatapointService;
    readonly Dataseries: Model<IDataseriesModel> = mongoose.model<IDataseriesModel>('Dataseries', DataseriesSchema);

    constructor(dataPointService: DatapointService) {
        this.dataPointService = dataPointService;
    }

    async getDataPoints(query: DataPointQuery): Promise<Object> {
        const dataseries: IDataseries[] = await this.getDataSeries(query.dataseriesIds);
        if (dataseries) {
            let result = {};
            for (let d of dataseries) {
                query.selectors = d.selectors;
                let datapoints: DataPoints = await this.dataPointService.get(query);
                if (datapoints) {
                    datapoints.dataseriesId = d._id;
                    datapoints.name = d.selectors.map(x => x.key + x.operator + x.value).join() || 'default';
                    result[d._id] = datapoints;
                }
            }
            return result;
        }
        return null;
    }

    async getDataSeries(ids: any[]):Promise<IDataseries[]> {
        return await this.Dataseries.find({_id: {$in: ids}}).populate("selectors").exec();
    }
}
