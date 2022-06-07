import mongoose from "mongoose";
import { course_model, course_schema } from "../course_model.js";
import {subtask_model, subtask_schema} from "./subtask_model.js";

const paper_schema = new mongoose.Schema(
  {
    type: {
        type: String,
        default: "paper",
    },
    
    dt_due: { 
        type: Date,
        default: Date.now 
    },

    progress: { //If we ever want to count paper 'progress' by number of subtasks completed
        type: Number,
        default: 0
    },

    complete: {
        type: Boolean,
        default: false
    },

    subtasks: [
        subtask_schema
    ]

    },

);


const paper_model = mongoose.model("paper_model", paper_schema);
export {paper_model, paper_schema};
