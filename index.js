import user_model from "./model/user_model.js";


//Need to connect mongodb before running any code which interacts with the database
//You can create your model objects beforehand, but mongodb must actually be connected for things like .save to work

//We need the mongoose setup, not the mongodb setup
import mongodb from "mongodb"
const MongoClient = mongodb.MongoClient;

import mongoose from 'mongoose';


// const mongo_cli = new MongoClient("mongodb://localhost:27017/creative_project_db");
// //Gives us a client through which we can now interact with mongodb

// try {
//     mongo_cli.connect();
// }
// catch (err){
//     console.error(err);
// }


mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/creative_project_db");
mongoose.connection.on('error', () => {
    throw new Error ('unable to connect to creative_project_db');
})


storage_test();
function storage_test() {
  let user = new user_model();

  user.firstName = "bob";
  user.lastName = "test";
  user.biography = "stinky";

  console.log(JSON.stringify(user));

  //markModified might be necessary if you're ever making changes to an array that's embedded within an object
  // user.markModified('firstName');
  
  // user.markModified('lastName');
  
  // user.markModified('biography');
  user.save() //Save creates a new entry, or updates an already existing one. Not sure under what conditions it updates an existing one
  .then(() => {
    console.log('saved');
  })
  .catch((error)=>{
    console.log(error);
  });
}
