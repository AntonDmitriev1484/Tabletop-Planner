
import mongoose from "mongoose";
import {homework_model, homework_schema} from "./homework_model.js"

const event_archive_schema = new mongoose.Schema(
  {
        past_events: [
            homework_schema
        ]
    },
    {
        collection: 'event_archives'
    }

);

//https://mongoosejs.com/docs/subdocs.html


const  event_archive_model =  mongoose.model("event_archive_model", event_archive_schema);

  
export {event_archive_model, event_archive_schema};
