
import mongoose from "mongoose";
// const {model, Schema} = mongoose;

// console.log(mongoose.modelNames());

// course_schema = require("course_model");
import {course_model, course_schema} from "./course_model.js";

//pcourse "personal course"

const pcourse_schema = new mongoose.Schema(
  {
        course: course_schema,
    
        tags: [],

        description: {
            type: String,

        },
        note: {
            type: String,

        },
        semester_taken: {
            type: Number,

        },
        description: {
            type: String
        }
    },

);

//https://mongoosejs.com/docs/subdocs.html

const pcourse_model = mongoose.model("pcourse_model", pcourse_schema);
export {pcourse_model, pcourse_schema};
