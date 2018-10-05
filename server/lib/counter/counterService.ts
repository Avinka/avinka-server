import {Client} from "elasticsearch";
import {Activity} from "../activity/activity";

export class CounterService {

    readonly client: Client;
    readonly indexName;
    readonly indexType;

    constructor(client: Client, indexName: string, indexType: string) {
        this.client = client;
        this.indexName = indexName;
        this.indexType = indexType;
    }

    async get(query: Object): Promise<Object> {
        const agg = {
            'grouping': {
                'date_histogram': {
                    'field': 'published',
                    'interval': 3600000,
                    'offset': 0,
                    'order': {'_key': 'asc'},
                    'keyed': false,
                    'min_doc_count': 0
                }
            }
        };
        const body = {
            'query': query,
            '_source': false,
            'aggregations': agg
        };
        const aggregation = await this.client.search<Activity>({
            index: this.indexName,
            type: this.indexType,
            body: body
        });
        const buckets = aggregation.aggregations.grouping.buckets;
        let counts = {};
        buckets.map(x => {
            const a = x['key_as_string'];
            const b = x['doc_count'];
            counts[a] = b;

        });
        return counts;
    }
}
