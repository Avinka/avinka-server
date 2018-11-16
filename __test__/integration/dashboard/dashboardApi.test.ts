import app from '../../../lib/app';
import * as moment from 'moment';
import {ObjectID} from "bson";
import {startUpMongo, tearDownMongo} from "../mongohelper";

const request = require('supertest')(app);

beforeAll(startUpMongo);
afterAll(tearDownMongo);

describe('/dashboards', () => {

    test('It should respond with 201 to well formed POST requests, the body should contain the newly created dashboard', async (done) => {
        // Create a dashboard
        const dashboard = {
            name: 'test_dashboard_1'
        };
        let dashboardResult = await request.post('/dashboard')
            .send(dashboard)
            .set('Accept', 'application/json')
            .then();
        expect(dashboardResult.status).toEqual(201);
        expect(dashboardResult.body._id.length).toBeGreaterThan(0);
        expect(dashboardResult.body.name).toEqual(dashboard.name);
        expect(dashboardResult.body.createdAt.length).toBeGreaterThan(0);
        expect(moment.duration(moment(dashboardResult.body.createdAt).diff(new Date())).asSeconds()).toBeLessThan(10);

        // Get the created dashboard
        const singleGet = await request.get('/dashboard/' + dashboardResult.body._id)
            .send()
            .set('Accept', 'application/json')
            .then();
        expect(dashboardResult.body).toEqual(singleGet.body);
        done();
    });

    test('It should respond with 404 on unknown ids', async (done) => {
        const result = await request.get('/dashboard/' + new ObjectID())
            .set('Accept', 'application/json')
            .send()
            .then();
        expect(result.status).toEqual(404);
        done();
    });

    test('It should respond with 400 on malformed ids', async (done) => {
        const result = await request.get('/dashboard/UNKNOWN')
            .set('Accept', 'application/json')
            .send()
            .then();
        expect(result.status).toEqual(400);
        done()
    });

    test('It should respond with 200 on a delete request and should be gone afterwards', async (done) => {
        // Create a dashboard
        const dashboard = {
            name: 'test_dashboard_1'
        };
        let dashboardResult = await request.post('/dashboard')
            .send(dashboard)
            .set('Accept', 'application/json')
            .then();

        // delete dashboard
        const deleteResult = await request.delete('/dashboard/' + dashboardResult.body._id).send().then();
        expect(deleteResult.status).toEqual(200);

        // Get the deleted dashboard
        const singleGet = await request.get('/dashboard/' + dashboardResult.body._id)
            .send()
            .set('Accept', 'application/json')
            .then();
        expect(singleGet.status).toEqual(404);
        done();
    });

    test('It should updated after a put request', async (done) => {
        // Create a dashboard
        const dashboard = {
            name: 'test_dashboard_1'
        };
        const dashboardResult = await request.post('/dashboard')
            .set('Accept', 'application/json')
            .send(dashboard)
            .then();

        // update the dashboard
        dashboardResult.body.name += 'updated';
        const updateResult = await request.put('/dashboard/' + dashboardResult.body._id)
            .set('Accept', 'application/json')
            .send(dashboardResult.body)
            .then();
        expect(updateResult.body.name).toEqual(dashboardResult.body.name);

        // Get the update dashboard
        const singleGet = await request.get('/dashboard/' + dashboardResult.body._id)
            .set('Accept', 'application/json')
            .send()
            .then();
        expect(singleGet.body.name).toEqual(dashboardResult.body.name);
        done();
    });

    test('It should respond with 200 and a complete graph entity after adding it to a dashboard', async (done) => {
        // Create a dashboard
        const dashboard = {
            name: 'test_dashboard'
        };
        let dashboardResult = await request.post('/dashboard')
            .send(dashboard)
            .set('Accept', 'application/json')
            .then();
        expect(dashboardResult.body.graphs.length).toEqual(0);

        // Create a graph
        const graph = {
            name: 'test_graph'
        };
        const graphResult = await request.post('/graph')
            .send(graph)
            .set('Accept', 'application/json')
            .then();

        // Fails validation on unset graphId in body
        let mappingResult = await request.post('/dashboard/' + dashboardResult.body._id + '/graph')
            .send({_id: graphResult.body._id})
            .set('Accept', 'application/json')
            .then();
        expect(mappingResult.status).toEqual(422);

        // Connect the graph to the dashboard
        mappingResult = await request.post('/dashboard/' + dashboardResult.body._id + '/graph')
            .send({graphId: graphResult.body._id})
            .set('Accept', 'application/json')
            .then();
        expect(mappingResult.status).toEqual(201);

        dashboardResult = await request.get('/dashboard/' + dashboardResult.body._id)
            .send()
            .set('Accept', 'application/json')
            .then();
        expect(dashboardResult.body.graphs.length).toEqual(1);
        expect(dashboardResult.body.graphs[0]).toEqual(graphResult.body._id);

        dashboardResult = await request.get('/dashboard/' + dashboardResult.body._id + '/graph')
            .send()
            .set('Accept', 'application/json')
            .then();
        expect(dashboardResult.body.length).toEqual(1);
        expect(dashboardResult.body[0].name).toEqual(graph.name);
        // default dataseries has been created
        expect(dashboardResult.body[0].dataseries.length).toEqual(1);
        expect(dashboardResult.body[0].dataseries[0].selectors.length).toEqual(0);

        done();
    });
});
