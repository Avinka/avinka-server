import {Client} from "elasticsearch";
import {v4 as uuid} from 'uuid';
import {Activity} from "./activity";
import {ActivityGenerator} from "./ActivityGenerator";
import _ from 'lodash';

export class ActivityService {

    readonly client: Client;
    readonly indexName;
    readonly indexType;

    constructor(client: Client, indexName: string, indexType: string) {
        this.client = client;
        this.indexName = indexName;
        this.indexType = indexType;
    }

    async get(query: string): Promise<Array<Activity>> {
        return (await this.client.search<Activity>({
            index: this.indexName,
            type: this.indexType,
            body: query
        })).hits.hits.map(a => a._source);
    }

    async create(a: Activity): Promise<Activity> {
        const activity = this.preProcess(a);
        await this.client.create({
            index: this.indexName,
            id: activity.id,
            type: this.indexType,
            body: activity
        });
        return activity;
    }

    async delete(query: string): Promise<void> {
        (await this.client.deleteByQuery({
            index: this.indexName,
            type: this.indexType,
            body: query
        }));
    }

    preProcess(a: Activity): Activity {
        if (!a.id) {
            a.id = uuid();
        }
        if (!a.published) {
            a.published = new Date().toISOString()
        }
        return a;
    }

    async generateData(): Promise<void> {
        for (let i = 0; i <= 1000; i++) {
            await this.create(ActivityGenerator.generate())
        }
    }
    async deleteData(): Promise<void> {
        await this.delete('{ "query": { "match_all": {}}}')
    }

    async getKeyValueOptions() {
        const result = await this.client.indices.getMapping({index: 'active-objects-current'});
        console.log(result);

        const keys = [];
        _.values(result["active-objects-current"].mappings.activity.properties, function(val) {
            keys.push()
        });
    }

}
