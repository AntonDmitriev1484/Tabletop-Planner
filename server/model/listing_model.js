import mongoose from "mongoose";

//Had a problem here: whenever you call deconstruct into {model, Schema} in earlier files, it would say that course_model already
//exists even though it definitley does not and JavaScript is the most moronic fucking language known to man
//I think this has something to do with the order in which I'm declaring and exporting the models

const listing_schema = new mongoose.Schema(
  {
        name: { 
            type: String,
            required: "Listing name is required"
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
        
        listing_desc: {
            type: String
        },
    },

);

//https://mongoosejs.com/docs/subdocs.html


const  listing_model =  mongoose.model("listing_model", listing_schema);

  
export {listing_model, listing_schema};
