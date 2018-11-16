import app from '../../../lib/app';
import * as moment from 'moment';
import {ObjectID} from "bson";
import {startUpMongo, tearDownMongo} from "../mongohelper";

const request = require('supertest')(app);

beforeAll(startUpMongo);
afterAll(tearDownMongo);

describe('/dataseries', () => {
    test('It should respond with 201 to well formed POST requests, the body should contain the newly created graph', async (done) => {
        const dataseries = {
            name: 'test_dataseries_1'
        };

        const postResult = await request.post('/dataseries')
            .set('Accept', 'application/json')
            .send(dataseries)
            .then();
        expect(postResult.status).toEqual(201);
        expect(postResult.body._id.length).toBeGreaterThan(0);
        expect(postResult.body.name).toEqual('test_dataseries_1');
        expect(postResult.body.createdAt.length).toBeGreaterThan(0);
        expect(moment.duration(moment(postResult.body.createdAt).diff(new Date())).asSeconds()).toBeLessThan(10);

        const singleGetResult = await request.get('/dataseries/' + postResult.body._id)
            .set('Accept', 'application/json')
            .send()
            .then();
        expect(singleGetResult.status).toEqual(200);
        expect(singleGetResult.body).toEqual(postResult.body);

        done();
    });

    test('It should respond with 404 on unknown ids', async (done) => {
        const unknownId = new ObjectID().toHexString();
        const result = await request.get('/dataseries/' + unknownId)
            .set('Accept', 'application/json')
            .send()
            .then();
        expect(result.status).toEqual(404);
        done();
    });

    test('It should respond with 400 on malformed ids', async (done) => {
        const result = await request.get('/dataseries/UNKNOWN')
            .set('Accept', 'application/json')
            .send()
            .then();
        expect(result.status).toEqual(400);
        done()
    });

    test('It should respond with 200 on a delete request and should be gone afterwards', async (done) => {
        const dataseries = {
            name: 'test_dataseries_1'
        };
        const postResult = await request.post('/dataseries')
            .set('Accept', 'application/json')
            .send(dataseries)
            .then();

        const deleteResult = await request.delete('/dataseries/' + postResult.body._id)
            .then();
        expect(deleteResult.status).toEqual(200);

        const singleGetResult = await request.get('/dataseries/' + postResult.body._id)
            .then();
        expect(singleGetResult.status).toEqual(404);
        done();
    });

    test('It should updated after a put request', async (done) => {
        const dataseries = {
            name: 'test_dataseries_1'
        };
        const postResult = await request.post('/dataseries')
            .set('Accept', 'application/json')
            .send(dataseries)
            .then();

        dataseries['_id'] = postResult.body._id;
        dataseries.name = dataseries.name += '_updated';
        const putResult = await request.put('/dataseries/' + postResult.body._id)
            .send(dataseries)
            .then();
        expect(putResult.body.name).toEqual(dataseries.name);

        const response = await request.get('/dataseries/' + postResult.body._id);
        expect(response.body.name).toEqual(dataseries.name);
        done();
    });

    test('It should respond with selectors after adding them', async (done) => {
        // Create a dataseries
        const dataseries = {
            name: 'test_dataseries'
        };
        const postResult = await request.post('/dataseries')
            .send(dataseries)
            .set('Accept', 'application/json')
            .then();

        let singleGetDataseriesResult = await request.get('/dataseries/' + postResult.body._id)
            .send()
            .set('Accept', 'application/json')
            .then();
        expect(singleGetDataseriesResult.body.selectors.length).toEqual(0);

        const selector = {
            name: 'test_selector'
        };
        const selectorPostResult = await request.post('/selector')
            .send({key:'a', operator:'=', value:'b'})
            .set('Accept', 'application/json')
            .then();

        const selectorGetResult = await request.post('/dataseries/' + postResult.body._id + '/selector')
            .send({_id: selectorPostResult.body._id})
            .set('Accept', 'application/json')
            .then();
        expect(selectorGetResult.status).toEqual(200);
        expect(selectorGetResult.body.length).toEqual(1);
        expect(selectorGetResult.body[0].key).toEqual('a');
        expect(selectorGetResult.body[0].operator).toEqual('=');
        expect(selectorGetResult.body[0].value).toEqual('b');

            singleGetDataseriesResult = await request.get('/dataseries/' + postResult.body._id)
            .send()
            .set('Accept', 'application/json')
            .then();
        expect(singleGetDataseriesResult.body.selectors.length).toEqual(1);
        expect(singleGetDataseriesResult.body.selectors[0].key).toEqual('a');
        expect(singleGetDataseriesResult.body.selectors[0].operator).toEqual('=');
        expect(singleGetDataseriesResult.body.selectors[0].value).toEqual('b');
        done();
    });
});
