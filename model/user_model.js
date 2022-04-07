import mon from "mongoose"
//import { model, Schema } from "mongoose";
const {model, Schema} = mon;

//import connect from "../connect_mongo.js";

const user_schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    biography: { type: String, required: true },
  },
  { collection: 'user_test' }
);

const user_model = model("user_model", user_schema);
export default user_model;

//Creating a collection within mongodb is where you can actually configure it to automatically enforce rules on certain fields
// db.createCollection(
//     "user test",
//     { capped : true, size : 6142800, max : 10000 },
//     {
//         bsonType: "object",
//        firstName: {
//         bsonType: "string"
//        },
//        lastName: {
//         bsonType: "string"
//        },
//        bio: {
//         bsonType: "string"
//        }
//     }
// )