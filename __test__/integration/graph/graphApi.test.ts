import app from '../../../lib/app';
import * as moment from 'moment';
import {ObjectID} from "bson";
import {startUpMongo, tearDownMongo} from "../mongohelper";

const request = require('supertest')(app);

beforeAll(startUpMongo);
afterAll(tearDownMongo);

describe('/graphs', () => {
    test('It should respond with 201 to well formed POST requests, the body should contain the newly created graph', async (done) => {
        const graph = {
            name: 'test_graph_1'
        };

        const postResult = await request.post('/graph')
            .set('Accept', 'application/json')
            .send(graph)
            .then();
        expect(postResult.status).toEqual(201);
        expect(postResult.body._id.length).toBeGreaterThan(0);
        expect(postResult.body.name).toEqual('test_graph_1');
        expect(postResult.body.createdAt.length).toBeGreaterThan(0);
        expect(moment.duration(moment(postResult.body.createdAt).diff(new Date())).asSeconds()).toBeLessThan(10);

        const singleGetResult = await request.get('/graph/' + postResult.body._id)
            .set('Accept', 'application/json')
            .then();
        expect(singleGetResult.status).toEqual(200);
        expect(singleGetResult.body).toEqual(postResult.body);

        const secondGraph = {
            name: 'test_graph_1'
        };
        const postResult2 = await request.post('/graph')
            .set('Accept', 'application/json')
            .send(secondGraph)
            .then();

        const multiGetResult = await request.get('/graph/' + postResult2.body._id + ',' + postResult.body._id)
            .then();
            expect(multiGetResult.status).toEqual(200);
            expect(multiGetResult.body.length).toEqual(2);
            expect(multiGetResult.body[1].name).toEqual(postResult2.body.name);
            expect(multiGetResult.body[0].name).toEqual(postResult.body.name);
        done();
    });

    test('It should respond with 404 on unknown ids', async (done) => {
        const result = await request.get('/graph/' + new ObjectID())
            .set('Accept', 'application/json')
            .send()
            .then();
        expect(result.status).toEqual(404);
        done();
    });

    test('It should respond with 400 on malformed ids', async (done) => {
        const result = await request.get('/graph/UNKNOWN')
            .set('Accept', 'application/json')
            .send()
            .then();
        expect(result.status).toEqual(400);
        done()
    });

    test('It should respond with 200 on a delete request and should be gone afterwards', async (done) => {
        const graph = {
            name: 'test_graph_1'
        };
        const postResult = await request.post('/graph')
            .set('Accept', 'application/json')
            .send(graph)
            .then();

        const deleteResult = await request.delete('/graph/' + postResult.body._id)
            .then();
        expect(deleteResult.status).toEqual(200);

        const singleGetResult = await request.get('/graph/' + postResult.body._id)
            .then();
        expect(singleGetResult.status).toEqual(404);
        done();
    });

    test('It should respond with 200 on a delete request and should be gone afterwards', async (done) => {
        const graph = {
            name: 'test_graph_1'
        };
        const postResult = await request.post('/graph')
            .set('Accept', 'application/json')
            .send(graph)
            .then();

        graph['_id'] = postResult.body._id;
        graph.name += 'updated';
        const putResult = await request.put('/graph/' + postResult.body._id)
            .send(graph)
            .then();
        expect(putResult.body.name).toEqual(graph.name);

        const response = await request.get('/graph/' + postResult.body._id);
        expect(response.body.name).toEqual(graph.name);
        done();
    });

    test('It should respond with a complete dataseries entity as default', async (done) => {
        // Create a graph
        const graph = {
            name: 'test_graph'
        };
        const graphResult = await request.post('/graph')
            .send(graph)
            .set('Accept', 'application/json')
            .then();

        const singleGetGraphResult = await request.get('/graph/' + graphResult.body._id)
            .send()
            .set('Accept', 'application/json')
            .then();
        expect(singleGetGraphResult.body.name).toEqual(graph.name);
        // default dataseries has been created
        expect(singleGetGraphResult.body.dataseries.length).toEqual(1);
        expect(singleGetGraphResult.body.dataseries[0].selectors.length).toEqual(0);

        done();
    });

});
