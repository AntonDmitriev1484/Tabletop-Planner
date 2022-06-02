
import mongoose from "mongoose";

import {listing_model, listing_schema} from "./listing_model.js";


const course_schema = new mongoose.Schema(
  {
        listing: {
            type:listing_schema,
            required: true
        },

        description: {
            type: String,

        },
        note: {
            type: String,

        },

    },

);

//https://mongoosejs.com/docs/subdocs.html

const course_model = mongoose.model("course_model", course_schema);
export {course_model, course_schema};
