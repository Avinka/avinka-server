import {ISelector} from "../query/selector";

export class DataPointQuery {
    since?: Date;
    until?: Date;
    agg_interval?: string;
    dataseriesIds: any[] = [];
    selectors: ISelector[];

    isEmpty() {
        return !this.since && !this.until && this.selectors.length == 0;
    }

    hasNoTime() {
        return !this.since && !this.until;
    }
}
