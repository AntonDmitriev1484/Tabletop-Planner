import mongoose from "mongoose";
const {model, Schema} = mongoose;

import crypto from "crypto";
import { timeStamp } from "console";

const user_schema = new Schema(
  {
    date_time_created: { 
        type: Date, 
        default: Date.now 
    },
    username: { //Might want to create a compound index. https://www.mongodb.com/docs/manual/indexes/
            //I'll just use the object_id index which mongodb provides and leave this for later
        type: String,
        required: "Username is required"
    },
    username_num_code: { //Discord style, adding a unique 4 digit code to each user, so that users can have the same username
        type: Number,
    },
    email: {
        type: String,
        required: "Email is required"
        //Possible regex opportunity here
    },
    pass_hash: {
        type: String,
        required: "Password hash is required"
    },
    salt: {
        type: String
    },
    first_name: { 
        type: String, 
    },
    last_name: { 
        type: String,
    },
    semester: { 
        type: Number
    },

    events_unresolved: [ //This can probably stay as an array because at any given time you will have less than 20 homework assignments
            // {
            //       type: mongoose.Schema.Types.Homework
            // }
    ], //Unresolved events will be embedded, to decrease look-up times for that week

    events_resolved: [ //Resolved events will be stored by reference, these will probably be accessed less frequently
            {
                  type: mongoose.Schema.Types.ObjectId,
            }
        ]
  },

    { 
      collection: 'user' 
    }
);

//Setting up virtual fields

user_schema.virtual('password')
    .set( //this set function will be called anytime we say model.password = ...
        function (pass) {

            //Hashing code taken from: https://www.loginradius.com/blog/engineering/password-hashing-with-nodejs/
            this.salt = crypto.randomBytes(16).toString('hex');
            this.pass_hash = crypto.pbkdf2Sync(pass, this.salt, 1000, 64, `sha512`).toString(`hex`); 
            //End of citation
        }
    );

user_schema.virtual('full_name')
    .set(
        function (full_name){
            let whitespace = false;
            this.first_name = "";
            this.last_name = "";

            for (let i = 0; i< full_name.length;i++){
                if (full_name.charAt(i) !== ' '){
                    if (!whitespace){
                        this.first_name += full_name.charAt(i);
                    }
                    else {
                        this.last_name += full_name.charAt(i);
                    }
                }
                else {
                    whitespace = true;
                }

            }
        }
    )
    .get(
        function (){
            return this.first_name + " " + this.last_name;
        }
    )


//Setting up functions that our model can use with its data
//Instance methods

//Maybe adde a function which can embed a homework
//or update an embedded homework
//Add a function which automatically unembeds and references homeworks which have already been completed
//Could we possibly add a listener on the progress field of homework?


user_schema.methods = {

    //Most importantly, mongoose lets us add a password validation function into the model object.
    check_pass: function(pass_attempt) {
        //hashes the incoming password
        let hash = crypto.pbkdf2Sync(pass_attempt, this.salt, 1000, 64, `sha512`).toString(`hex`); 
        return this.pass_hash === hash; 
    },

    add_homework: function(homework) {
        //Expected parameter is a homework model object
        this.events_unresolved.push(homework);

    },

    // update_homework: function (updated_homework) {
    //     //Rather than creating two objects, it'd be easier if I could pass the key value pair
    //     //which I want to update as the parameter, and then simply update that k-v pair in the object

    //     //Perform linear search over events_unresolved
    //     //whenever you find a matching object id, swap contents with the updated_homework

    //     for (let i =0; i< this.events_unresolved.length;i++){
    //         if (updated_homework._id === this.events_unresolved[i]._id){
    //             this.events_unresolved[i] = updated_homework;
    //         }
    //     }
    // }

    //MongoDB model objects already provide an updateOne function
//https://www.codementor.io/@prasadsaya/working-with-arrays-in-mongodb-16s303gkd3

}

const user_model = model("user_model", user_schema);
export default user_model;





//Doing one to many relationship:
// Tutorial: https://www.bezkoder.com/mongoose-one-to-many-relationship/

//  Referenced, just specify an array of type String to store ref _ids
//  {    
//     _id: "5db579f5faf1f8434098f7f5"
//     title: "Tutorial #1",
//     author: "bezkoder"
//     comments: [ "5db57a03faf1f8434098f7f8", "5db57a04faf1f8434098f7f9" ],
//   }
//   // Comments
//   {
//     _id: "5db57a03faf1f8434098f7f8",
//     username: "jack",
//     text: "This is a great tutorial.",
//     createdAt: 2019-10-27T11:05:39.898Z
//   }
//   {
//     _id: "5db57a04faf1f8434098f7f9",
//     username: "mary",
//     text: "Thank you, it helps me alot.",
//     createdAt: 2019-10-27T11:05:40.710Z
//   }
// Schema
// comments: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Comment"
//     }
//   ]

//  Embedded uses an array to manage embedded elements

// const mongoose = require("mongoose");
// const Tutorial = mongoose.model(
//   "Tutorial",
//   new mongoose.Schema({
//     title: String,
//     author: String,
//     images: []
//   })
// );
// module.exports = Tutorial;

//const createImage = function(tutorialId, image) {
//     console.log("\n>> Add Image:\n", image);
//     return db.Tutorial.findByIdAndUpdate(
//       tutorialId,
//       {
//         $push: {
//           images: {
//             url: image.url,
//             caption: image.caption
//           }
//         }
//       },
//       { new: true, useFindAndModify: false }
//     );
//   };
