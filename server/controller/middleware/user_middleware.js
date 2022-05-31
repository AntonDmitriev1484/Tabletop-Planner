import {user_model} from '../../model/user_model.js'
import {event_archive_model, event_archive_schema} from "../../model/event_archive_model.js"



//Session authentication
const check_session = (req, res, next) => {
    console.log('checking session');
    if (global.session.username === req.params.username){
        next()
    }
    else {
        return res.status(400).json({message:"You are not authorized to manipulate this user's information"});
    }
}



async function load_user_by_username (req, res, next) {
    console.log('loading user');

    let username = req.body.username; //When we login username is in the body of the request

    if (req.body.username === undefined) {
        username = req.params.username; //Otherwise, its a route parameter
    }


    let user = await user_model.findOne({"username": username}).exec();

    if (user !== null) {
        req.user = user;
        next();
    }
    else {
        return res.status(202).json({status:202, message:"User with this username doesn't exist."});
    }
}

function create_event_archive (req, res, next) {

    const event_archive = new event_archive_model();

    const success = () => {
        req.event_archive = event_archive;
        next();
    }

    //Not sure if this will actually return an archive
    event_archive.save().then( 
        success
     )
     .catch( 
        (err) => {
            res.status(400);
            res.json();
        } 
     )

}

async function find_unresolved_event (req, res, next) {

    const target_id = req.body._id;

    const user = req.user;
    
    // let found_event = [];

    //Not super efficient, but starting from the user is probably more efficient
    //than mongo starting from the root of the collection
    //Linear search will be over at most 15 or so items since the list is activley maintained
    // for (let i = 0; i<user.events_unresolved.length; i++){
    //     let event = user.events_unresolved[i];
    //     if (event._id == target_id){

    //         found(i);
    //         found_event = true;
    //     }
    // }


    //found_event will be set to an array which will only contain
    //the single (or none) event which matches the target_id

    // found_event = user.events_unresolved.filter(
    //     (event) => {
    //         return event._id == target_id;
    // ``  }
    // )

    // if (!found_event) {
    //     this.info.status = 203; //idk man
    //     this.info.message = "Couldn't find event with this _id";

    //     this.res.status(this.info.status);
    //     this.res.json(this.info);
    // }


    let index = 0;
    let found = false;
    user.events_unresolved.forEach(
        (event) => {
            if (event._id == target_id) {
                found = true;
                req.event_index = index;
                next();
            }
            index++;
        }
    )

    if (!found){
        res.status(400);
        res.json();
    }
}

async function find_current_course (req, res, next) {

    const target_id = req.body._id;
    const user = req.user;

    let index = 0;
    let found = false;

    user.courses_current.forEach(
        (course) => {
            if (course._id == target_id) {
                found = true;
                req.course_index = index;
                next();
            }
            index++;
        }
    )

    if (!found){
        res.status(400);
        res.json();
    }

}

async function load_event_archive(req, res, next) {

    let user = req.user;
    let archive_id = user.event_archive;

    event_archive_model.findOne({"_id":archive_id}).exec()
    .then(
        (archive) => {
            req.event_archive = archive;
            next();
        }
    )
    .catch (
        (err) => {
            res.status(400);
            res.json();
        }
    )
}

export {check_session, load_user_by_username, create_event_archive,
find_unresolved_event, find_current_course, load_event_archive}