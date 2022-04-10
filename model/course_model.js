import mongoose from "mongoose";
const {model, Schema} = mongoose;


const course_schema = new Schema(
  {
        name: { 
            type: String,
            required: "Course name is required"
        },
        dept_name: {
            type: String,
            //required: "Department name is required"
        },
        dept_code: {
            type: String,
            required: "Department code is required"
        },
        course_code: {
            type: String,
            required: "Course code is required"
        },
        official_description: {
            type: String
        },
        //Also add course_tag, files_links
    },

);

//https://mongoosejs.com/docs/subdocs.html

const course_model = model("course_model", course_schema);
export {course_model, course_schema};
