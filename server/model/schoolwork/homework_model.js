import mongoose from "mongoose";
import { course_model, course_schema } from "../course_model.js";

const homework_schema = new mongoose.Schema(
  {
    type: {
        type: String,
        default: "homework",
    },
    
    dt_due: { 
        type: Date,
        default: Date.now 
    },
    progress: {
        type: Number,
        default: 0
    },
    complete: {
        type: Boolean,
        default: false
    }

    },

);


const homework_model = mongoose.model("homework_model", homework_schema);
export {homework_model, homework_schema};
