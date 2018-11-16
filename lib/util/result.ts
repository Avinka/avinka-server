export class Result<A> {
    readonly data: Array<A>;

    constructor(data: Array<A>) {
        this.data = data;
    }
}
