import mongodb from "mongodb"
const MongoClient = mongodb.MongoClient;

import mongoose from 'mongoose';


function connect() {

    const mongo_cli = new MongoClient("mongodb://localhost:27017/creative_project_db");
    //Gives us a client through which we can now interact with mongodb

    try {
        mongo_cli.connect();
    }
    catch (err){
        console.error(err);
    }


    mongoose.Promise = global.Promise;
    mongoose.connect("mongodb://localhost:27017/creative_project_db");
    mongoose.connection.on('error', () => {
        throw new Error ('unable to connect to creative_project_db');
    })

    return mongo_cli;
}

export default connect;