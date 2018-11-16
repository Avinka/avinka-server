import {Client, SearchResponse} from "elasticsearch";
import {Activity} from "../activity/activity";
import {DataPoints} from "./datapoints";
import {EsQueryBuilder} from "../query/esQueryBuilder";
import {DataPointQuery} from "./datapointQuery";

export class DatapointService {

    readonly client: Client;
    readonly indexName;
    readonly indexType;

    constructor(client: Client, indexName: string, indexType: string) {
        this.client = client;
        this.indexName = indexName;
        this.indexType = indexType;
    }

    async get(query: DataPointQuery): Promise<DataPoints> {
        const esQuery = EsQueryBuilder.buildFromQuery(query)
        const agg = this.buildAggregation(query);
        const body = {
            'query': esQuery,
            '_source': false,
            'aggregations': agg
        };
        const response = await this.client.search<Activity>({
            index: this.indexName,
            type: this.indexType,
            body: body
        });
        return  this.buildDataPoints(response);
    }

    buildDataPoints(response: SearchResponse<Activity>): DataPoints {
        const buckets = response.aggregations.grouping.buckets;
        let counts = {};
        buckets.map(x => {
            const date = x['key_as_string'];
            const value = x['doc_count'];
            counts[date] = value;
        });
        let result = new DataPoints();
        result.data = counts;
        return result;
    }

    buildAggregation(query: DataPointQuery): Object {
        return {
            'grouping': {
                'date_histogram': {
                    'field': 'published',
                    'interval': 3600000,
                    'offset': 0,
                    'order': {'_key': 'asc'},
                    'keyed': false,
                    'min_doc_count': 0,
                    "missing": "0"
                }
            }
        };
    }
}
