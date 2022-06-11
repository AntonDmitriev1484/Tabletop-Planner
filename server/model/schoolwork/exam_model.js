import mongoose from "mongoose";
import { course_model, course_schema } from "../course_model.js";
import {subtask_model, subtask_schema} from "./subtask_model.js";

const exam_schema = new mongoose.Schema(
  {
    type: {
        type: String,
        default: "exam",
    },
    
    dt_due: { 
        type: Date,
        default: Date.now 
    },
    room: {
        type: String,
    },

    progress: { //If we ever want to count exam 'progress' by number of subtasks completed
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


const exam_model = mongoose.model("exam_model", exam_schema);
export {exam_model, exam_schema};
