import mongoose from "mongoose";
const {model, Schema} = mongoose;

import crypto from "crypto";
import { timeStamp } from "console";

import {homework_model, homework_schema} from "./homework_model.js"
import {pcourse_model, pcourse_schema} from "./pcourse_model.js"
import {university_model, university_schema} from "./university_model.js" //Necessary to compile university_model before using it in index.js
import {event_archive_model, event_archive_schema} from "./event_archive_model.js"


let user_schema = new Schema(
  {
    date_time_created: { 
        type: Date, 
        default: Date.now 
    },
    username: { 
        //At first, unique: true not being enforced. Steps to fix:
        //db.user.drop()
        //restart mongodb
        //MongoDB takes some time to add indices for unique items
        //If this field is already not unique in the collection then you need to drop the collection
        type: String,
        unique: true,
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

    events_unresolved: [ 
        homework_schema
    ],
    //This can probably stay as an array because at any given time you will have less than 20 homework assignments
    //Unresolved events will be embedded, to decrease look-up times for that week

    event_archive: {type: mongoose.Schema.ObjectId},

    courses_current: [
        pcourse_schema
    ],

    course_archive: {type: mongoose.Schema.ObjectId},

    university: {type: mongoose.Schema.ObjectId},

  },

    { 
      collection: 'user' 
    }
);

//Setting up our collection to be indexed by username
//This will help our lookup for users via username be as efficient as possible
//Use db.user.getIndexes() to see the currently active indexes for the user collection

user_schema.index({username:1},{unique:true});

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


// user_schema.methods.check_pass = function(pass_attempt) {
//     //hashes the incoming password
//     let hash = crypto.pbkdf2Sync(pass_attempt, this.salt, 1000, 64, `sha512`).toString(`hex`); 
//     return this.pass_hash === hash; 
// }

user_schema.methods = {

    //Most importantly, mongoose lets us add a password validation function into the model object.
    check_pass: function(pass_attempt) {
        //hashes the incoming password
        let hash = crypto.pbkdf2Sync(pass_attempt, this.salt, 1000, 64, `sha512`).toString(`hex`); 
        return this.pass_hash === hash; 
    },

    archive_event: async function(target) {
        const event_archive_id = this.event_archive;

        let event_archive = await event_archive_model.findOne({"_id":event_archive_id}).exec();
        
        // console.log(event_archive); //Not the slightest clue why its a fucking array
        // console.log(event_archive.past_events);

        const D = new Date().toISOString();
        target.date_time_archived = D;

        // target.date_time_archived = D.getMonth()+'/'+D.getDay()+'/'+D.getFullYear();

        event_archive.past_events.push(target);
        await event_archive.save();
    }

    // add_homework: function(homework) {
    //     //Expected parameter is a homework model object
    //     this.events_unresolved.push(homework);

    // },

    //MongoDB model objects already provide an updateOne function
    //https://www.codementor.io/@prasadsaya/working-with-arrays-in-mongodb-16s303gkd3

}


const user_model = model("user_model", user_schema);

// user_model.on('username', function(err) {
//     if (err) {
//         console.error('User index error: %s', err);
//     } else {
//         console.info('User indexing complete');
//     }
// });

export {user_model};


