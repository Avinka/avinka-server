import app from "./app";
import * as mongoose from "mongoose";
const PORT = 3000;

app.listen(PORT, () => {

    const uri: string = 'mongodb://127.0.0.1:27017/local';

    mongoose.connect(uri, (err: any) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log("Succesfully connected to " + uri)
        }
    });

    console.log('Express server listening on port ' + PORT);
});
