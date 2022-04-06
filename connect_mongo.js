// import mon from "mongoose"
// //import { model, Schema } from "mongoose";
// const {model, Schema} = mon;

import mongodb from "mongodb"
const MongoClient = mongodb.MongoClient;

const mongo_cli = new MongoClient("mongodb://localhost:27017/creative_project_db");
//Gives us a client through which we can now interact with mongodb

try {
    mongo_cli.connect();
}
catch (err){
    console.error(err);
}

a();

async function a() {
    const db_list = await mongo_cli.db().admin().listDatabases();
    console.log(db_list);
}




// // "use creative_project_db" automatically creates a new database creative_project_db

// let db_1 = new Mongo().getDB("creative_project_db");
// console.log(db_1);

// // Connect to the db
// MongoClient.connect("mongodb://localhost:27017/creative_project_db", function (err, client) {
   
//     let db = client.db;
//     console.log(db);

//      if(err){
//         throw err;
//      }
//      else {

//         db.collection('Persons', 
//             function (err, collection) {
//                 console.log('connected'); //Assuming that it has connected successfully
//                 collection.insert({ id: 1, firstName: 'Steve', lastName: 'Jobs' });
//             }
//         );
//      }

//      //Write databse Insert/Update/Query code here..
                
//});