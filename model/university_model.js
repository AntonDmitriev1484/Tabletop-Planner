import mongoose from "mongoose";
const {model, Schema} = mongoose;

import {course_model, course_schema} from "./course_model.js";


const university_schema = new Schema(
  {
        name: { 
            type: String,
            required: "University name is required"
        },
        courses: [
            course_schema
        ],
    },
    { 
      collection: 'university' 
    }
);

//https://mongoosejs.com/docs/subdocs.html

const university_model = model("unversity_model", university_schema);
export {university_model};
