import mongoose from "mongoose";
import { course_model, course_schema } from "../course_model.js";

const subtask_schema = new mongoose.Schema(
  {
    type: {
        type: String,
        default: "subtask",
    },
    
    dt_due: { 
        type: Date,
        default: Date.now 
    },

    progress: { //If we ever want to count subtask 'progress' by number of subtasks completed
        type: Number,
        default: 0
    },

    complete: {
        type: Boolean,
        default: false
    },

    name: {
        type: String
    }

    },

);


const subtask_model = mongoose.model("subtask_model", subtask_schema);
export {subtask_model, subtask_schema};
