import * as mongoose from "mongoose";
import MongodbMemoryServer from 'mongodb-memory-server';

let mongoServer;

export async function startUpMongo() {
    mongoServer = new MongodbMemoryServer();
    const mongoUri = await mongoServer.getConnectionString();
    await mongoose.connect(
        mongoUri,
        {useNewUrlParser: true},
    );
}

export async function tearDownMongo() {
    // via https://stackoverflow.com/a/51455290/2747869
    // Wait until indexes are created or you'll frequently get topology-destroyed errors
    // @ts-ignore
    await Promise.all(
        mongoose.modelNames().map(model => mongoose.model(model).createIndexes()),
    );
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
    mongoServer.stop();
}
