import {user_model} from '../../model/user_model.js'
import {event_archive_model, event_archive_schema} from "../../model/event_archive_model.js"

import USER_ERR from '../errors/user_errors.js'

global.session;

//Session authentication
const check_session = (req, res, next) => { // DOESN'T WORK
    console.log('checking session');

    if (global.session !== undefined) {
        if (global.session.username === req.params.username){
            next()
        }
        else {
            res.status(USER_ERR.FAILED_SESSION_CHECK.code);
            res.json({message: USER_ERR.FAILED_SESSION_CHECK.message});
        }
    }
    else { //If there is no active session throw an error
        res.status(USER_ERR.FAILED_SESSION_CHECK.code);
        res.json({message: USER_ERR.FAILED_SESSION_CHECK.message});
    }
}


function load_user_by_username (req, res, next) {
    console.log('loading user');

    let username = req.body.username; //When we login username is in the body of the request

    if (req.body.username === undefined) {
        username = req.params.username; //Otherwise, its a route parameter
    }

    user_model.findOne({"username": username}).exec()
    .then(
        (user) => {
            if (user !== null) {
                req.user = user;
                next();
            }
            else {
                res.status(USER_ERR.FAILED_TO_FIND_USER.code);
                res.json({message: USER_ERR.FAILED_TO_FIND_USER.message});
            }
        }
    )
    .catch(
        (err) => {
            console.log(err);

            res.status(USER_ERR.USER_QUERY_FAILED.code);
            res.json({message: USER_ERR.USER_QUERY_FAILED.message});
        }
    )
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
            console.log(err);

            res.status(USER_ERR.FAILED_TO_SAVE_EVENT_ARCHIVE.code);
            res.json({message: USER_ERR.FAILED_TO_SAVE_EVENT_ARCHIVE.message});
        } 
     )

}

async function find_unresolved_event (req, res, next) {

    const target_id = req.body._id;

    const user = req.user;

    let index = 0;
    let found = false;
    user.events.active.forEach(
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
        res.status(USER_ERR.FAILED_TO_FIND_UNRESOLVED_EVENT.code);
        res.json({message: USER_ERR.FAILED_TO_FIND_UNRESOLVED_EVENT.message});
    }
}

async function find_current_course (req, res, next) {

    const target_id = req.body._id;
    const user = req.user;

    let index = 0;
    let found = false;

    user.courses.active.forEach(
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
        res.status(USER_ERR.FAILED_TO_FIND_CURRENT_COURSE.code);
        res.json({message: USER_ERR.FAILED_TO_FIND_CURRENT_COURSE.message});
    }

}

async function load_event_archive(req, res, next) {

    let user = req.user;
    let archive_id = user.events.past;

    console.log(archive_id);

    event_archive_model.findOne({"_id":archive_id}).exec()
    .then(
        (archive) => {
            console.log(archive)
            if (archive !== null) {
                req.event_archive = archive;
                next();
            }
            else { //Mongodb couldnt find archive with this id
                //Needs a new error object, failed to find archive event by id
                res.status(USER_ERR.EVENT_ARCHIVE_QUERY_FAILED.code);
                res.json({message: USER_ERR.EVENT_ARCHIVE_QUERY_FAILED.message});
            }
        }
    )
    .catch (
        (err) => {
            res.status(USER_ERR.EVENT_ARCHIVE_QUERY_FAILED.code);
            res.json({message: USER_ERR.EVENT_ARCHIVE_QUERY_FAILED.message});
        }
    )
}




export {check_session, load_user_by_username, create_event_archive,
find_unresolved_event, find_current_course, load_event_archive}