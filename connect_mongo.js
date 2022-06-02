import mongodb from "mongodb"
const MongoClient = mongodb.MongoClient;

import mongoose from 'mongoose';


function connect() {

    const mongo_cli = new MongoClient("mongodb://localhost:27017/tabletop");
    //Gives us a client through which we can now interact with mongodb
    //Localhosted from the EC2 instance, the port mongodb runs on?

    try {
        mongo_cli.connect();
    }
    catch (err){
        console.error(err);
    }


    mongoose.Promise = global.Promise;
    mongoose.connect("mongodb://localhost:27017/tabletop");
    mongoose.connection.on('error', () => {
        throw new Error ('unable to connect to tabletop database');
    })

    return mongo_cli;
}

export default connect;