
import mongoose from "mongoose";
import {schoolwork_model, schoolwork_schema} from "./schoolwork/schoolwork_model.js"

const event_archive_schema = new mongoose.Schema(
    {
        past_events: [
            schoolwork_schema
        ]
    },
    {
        collection: 'event_archives'
    }

);

//https://mongoosejs.com/docs/subdocs.html


const  event_archive_model =  mongoose.model("event_archive_model", event_archive_schema);

  
export {event_archive_model, event_archive_schema};
