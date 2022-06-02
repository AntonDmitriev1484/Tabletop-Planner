import mongoose from "mongoose";
import { course_model, course_schema } from "../course_model.js";

const project_schema = new mongoose.Schema(
  {
    type: {
        type: String,
        default: "project",
    },
    
    dt_due: { 
        type: Date,
        default: Date.now 
    },

    progress: { //If we ever want to count project 'progress' by number of subtasks completed
        type: Number,
        default: 0
    },

    complete: {
        type: Boolean,
        default: false
    },

    subtasks: [

    ],

    collaborators: [
        //user refs?
    ]

    },

);


const project_model = mongoose.model("project_model", project_schema);
export {project_model, project_schema};
