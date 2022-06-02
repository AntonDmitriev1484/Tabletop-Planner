import mongoose from "mongoose";
// const {model, Schema} = mongoose;

import {listing_model, listing_schema} from "./listing_model.js";


const university_schema = new mongoose.Schema(
  {
        name: { 
            type: String,
            unique: true,
            required: "University name is required"
        },
        listings: [
            listing_schema
        ],
    },
    { 
      collection: 'university' 
    }
);


university_schema.index({name:1},{unique:true});

//https://mongoosejs.com/docs/subdocs.html

const university_model = mongoose.model("university_model", university_schema);
export {university_model, university_schema};
