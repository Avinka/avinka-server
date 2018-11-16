export interface ESQuery {
}

export class MatchAllQuery implements  ESQuery {
    match_all: {};
}

export class MatchQuery implements ESQuery {
    match: {};

    constructor(key: string, value: any) {
        this.match = {[key]: value}
    }
}

export class RangeQuery implements ESQuery {
    range: {};

    constructor(key: string, value: any, operator: string) {
        this.range = {[key]: {[operator]: value}}
    }
}
