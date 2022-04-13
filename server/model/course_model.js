import mongoose from "mongoose";
//const {model, Schema} = mongoose;
//Commented out because whenever you call deconstruct into {model, Schema} in earlier files, it would say that course_model already
//exists even though it definitley does not and JavaScript is the most moronic fucking language known to man

//I think this has something to do with the order in which I'm declaring and exporting the models
const course_schema = new mongoose.Schema(
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



// console.log( mongoose.models);
// if (mongoose.models.course_model) {
//     course_model = mongoose.model('course_model');
//   } else {
    

 const  course_model =  mongoose.model("course_model", course_schema);
 // }
  
export {course_model, course_schema};
