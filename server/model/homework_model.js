import mongoose from "mongoose";
// const {model, Schema} = mongoose;
import { pcourse_model, pcourse_schema } from "./pcourse_model.js";

const homework_schema = new mongoose.Schema(
  {
    date_time_created: { 
        type: Date,
        default: Date.now 
    },
    date_time_assigned: { 
        type: Date,
        default: Date.now 
    },
    date_time_due: { 
        type: Date,
        default: Date.now 
    },
    progress: {
        type: Number,
        default: 0
    },
    description: {
        type: String
    },
    note: {
        type: String
    },
    course: { //User should have posession over the immediate courses which it is taking, shouldn't be referenced
        //Should be of type personal course
        type: pcourse_schema,
        required: "Course is required"
    }
    //Also add work_tag, files_links
    },

);


const homework_model = mongoose.model("homework_model", homework_schema);
export {homework_model, homework_schema};
