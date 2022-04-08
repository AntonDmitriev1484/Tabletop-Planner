import mongoose from "mongoose";
const {model, Schema} = mongoose;


const homework_schema = new Schema(
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
        type: mongoose.Schema.Types.ObjectId,
        required: "Course is required"
    }
    //Also add work_tag, files_links
    },
    { 
      collection: 'homework' 
    }
);


const homework_model = model("homework_model", homework_schema);
export default homework_model;
