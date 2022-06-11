import mongoose from "mongoose";
import { course_model, course_schema } from "../course_model.js";
import { homework_model, homework_schema } from "../schoolwork/homework_model.js";
import { exam_model, exam_schema } from "../schoolwork/exam_model.js";
import { project_model, project_schema } from "../schoolwork/project_model.js";
import { paper_model, paper_schema } from "../schoolwork/paper_model.js";


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
    dt_focus: { 
        //This will change as you swap the event between days
        //This will automatically update to the current date if schoolwork is incomplete
        type: Date,
        default: Date.now
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


    // types: {
    //     type: String,
    //     required: true,
    //     enum: ['homework_model','exam_model','project_model','paper_model'], //These names match syntax of how mongoose I a made my modules
    // },

    type: {
        type: String,
        default: "homework",
    },

    work: {
        type: mongoose.Mixed,
    }

//     const Any = new Schema({ any: {} });
// const Any = new Schema({ any: Object });
// const Any = new Schema({ any: Schema.Types.Mixed });
// const Any = new Schema({ any: mongoose.Mixed });


    },

);


const schoolwork_model = mongoose.model("schoolwork_model", schoolwork_schema);
export {schoolwork_model, schoolwork_schema};
