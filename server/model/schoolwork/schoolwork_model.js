import mongoose from "mongoose";
import { course_model, course_schema } from "../course_model.js";

const schoolwork_schema = new mongoose.Schema(
  {
    dt_created: { 
        type: Date,
        default: Date.now 
    },
    dt_assigned: { 
        type: Date,
        default: Date.now 
    },
    dt_archived: { //Will only be set once the assignment has been archived
        type: Date
    },


    description: {
        type: String
    },
    note: {
        type: String
    },


    course: { //User should have posession over the immediate courses which it is taking, shouldn't be referenced
        //Should be of type personal course
        type: course_schema,
        required: "Course is required"
    },


    types: {
        type: String,
        required: true,
        enum: ['homework_model','exam_model','project_model','paper_model'], //These names match syntax of how mongoose I a made my modules
    },

    work: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'types',
    }


    },

);


const schoolwork_model = mongoose.model("schoolwork_model", schoolwork_schema);
export {schoolwork_model, schoolwork_schema};
