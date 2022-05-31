
import res from 'express/lib/response.js';
import mongoose from 'mongoose';
let m = mongoose.models;

import connect from '../../connect_mongo.js';
import {user_model} from '../model/user_model.js'
import {event_archive_model, event_archive_schema} from "../model/event_archive_model.js"

import controller_prototype from './prototypes/controller_prototype.js'

import {saveUser, run_on_unresolved_event, saveArchive} from './helpers/helpers.js'

global.session;

//We'll end up with one controller object per route

//Make an instance of the controller
let create_user = Object.create(controller_prototype);

//Create a controller function which will be run in the context of this object
//So they don't really work by themselves, but only when bound to a controller
function create_user_handler(req,res) {

    this.req = req;
    this.res = res;

    const event_archive = req.event_archive;

    this.info.message += "Event archived added. "

    let user = new user_model(req.body);

    //Gives each new user a ref to their event_archive
    user.event_archive = event_archive.id;

    saveUser(this.req, this.res, user, this.info);

}


create_user.run = create_user_handler.bind(create_user);
//Simply setting the function doesn't do anything, you have to bind it

//Set properties of the instance, ex. what error_status this controller should send out, what error_message it should have
create_user.error_status = 400;
create_user.error_message = "Couldn't create archive";






let login_user = Object.create(controller_prototype);

function login_user_handler(req, res) {

    this.req = req;
    this.res = res;

    let username = req.body.username;
    let pass_attempt = req.body.password;

    let user = req.user;

    if (user.check_pass(pass_attempt)){
        global.session=req.session;
        global.session.username=req.body.username; //On login we set username in the session object
        this.info.message += "User logged in successfully";
    }
    else {
        this.info.status = 201; //idk man
        this.info.message += "User exists but password is incorrect";
    }

    this.res.status(this.info.status);
    this.res.json(this.info);

}

login_user.run = login_user_handler.bind(login_user);
login_user.error_status = 402; //Couldn't find user
login_user.error_message = "Error thrown while searching database for user. "


//JUST PULL THE USER AS MIDDLEWARE YOU SILLYHEAD



const logout_user = (req, res) => {
    //Will just clear the username field of our session
    req.session.username = "";
    global.session.username = "";
    req.session.destroy();

    return res.status(200).json({message:"User has successfully been logged out", success: true});

}





let add_event = Object.create(controller_prototype);

function add_event_handler (req, res) {

    this.req = req;
    this.res = res;

    let user = req.user;

    
    let homework = m.homework_model(req.body);
    user.events_unresolved.push(homework);

    saveUser(this.req, this.res, user, this.info);
}

add_event.run = add_event_handler.bind(add_event);

add_event.error_status = 402; //Couldn't find user
add_event.error_message = "Error thrown while searching database for user. ";





let delete_unresolved_event = Object.create(controller_prototype);

function delete_unresolved_event_handler (req, res) {

    this.req = req;
    this.res = res;

    let user = req.user;
    let event_index = req.event_index;

    user.events_unresolved.splice(event_index,1);

    this.info.message += "Event successfully deleted. ";
    saveUser(this.req, this.res, user, this.info);

    // const found = (i) => {
    //     user.events_unresolved.splice(i,1);
    //     saveUser(this.req, this.res, user, this.info);
    // }

    // run_on_unresolved_event(this.req, this.res, user, found);

}

delete_unresolved_event.run = delete_unresolved_event_handler.bind(delete_unresolved_event);
delete_unresolved_event.error_code = 400;
delete_unresolved_event.error_message = "Temp";




let update_event = Object.create(controller_prototype);

function update_event_handler(req, res) {
    this.req = req;
    this.res = res;

    let user = req.user;
    let event_index = req.event_index;


    user.events_unresolved[event_index] = this.req.body;

    if (this.req.body.progress >= 100){
                //IF YOU'RE HAVING A BUG WHERE IT DOESN"T UPDATE THIS IS PROBABLY THE SOLUTION
                // user.events_unresolved[i] = req.body;
                
        user.events_unresolved.splice(event_index,1);
        user.archive_event(this.req.body); //So that the archive will get the most recently updated version

    }

    saveUser(this.req, this.res, user, this.info);


    // const found = (i) => {
    //     user.events_unresolved[i] = this.req.body;
    //         //console.log(req.body.progress);
    //         if (this.req.body.progress >= 100){
    //             //IF YOU'RE HAVING A BUG WHERE IT DOESN"T UPDATE THIS IS PROBABLY THE SOLUTION
    //             // user.events_unresolved[i] = req.body;
                
    //             user.events_unresolved.splice(i,1);
    //             user.archive_event(this.req.body); //So that the archive will get the most recently updated version
    //             saveUser(this.req, this.res, user, this.info);
    //         }
    // }

    // run_on_unresolved_event(this.req, this.res, user, found);
}


update_event.run = update_event_handler.bind(update_event);
update_event.error_code = 400;
update_event.error_message = "Temp";






let read_unresolved_events = Object.create(controller_prototype);

function read_unresolved_events_handler (req, res) {
    this.req = req;
    this.res = res;


    let user = req.user;

    this.info.message = "Returning all unresolved events for user.";

    //User unresolved events will be sent under a newly added content field
    this.info.content = user.events_unresolved;


    this.res.status(this.info.status);
    this.res.json(this.info);

}

read_unresolved_events.run = read_unresolved_events_handler.bind(read_unresolved_events);
read_unresolved_events.error_code = 400;
read_unresolved_events.error_message = "Temp";





let add_course = Object.create(controller_prototype);

function add_course_handler (req, res) {
    this.req = req;
    this.res = res;

    let user = req.user;
    
    let pcourse = new m.pcourse_model(req.body);
    user.courses_current.push(pcourse);

    this.info.message += "Course added successfully. "

    saveUser(this.req, this.res, user, this.info);

}

add_course.run = add_course_handler.bind(add_course);



let read_courses = Object.create(controller_prototype);

function read_courses_handler (req, res) {

    this.req = req;
    this.res = res;
    
    let user = req.user;

    this.info.message = "Returning all current courses for this user.";
    this.info.content = user.courses_current;

    res.status(this.info.status);
    res.json(this.info);

}

read_courses.run = read_courses_handler.bind(read_courses);





let update_course = Object.create(controller_prototype);

function update_course_handler(req, res) {

    this.req = req;
    this.res =res;

    let user = req.user;

    let course_index = req.course_index;

    // let target_id = req.body.target_id;
    // let found = false;

    // for (let i = 0; i<user.courses_current.length; i++){
    //     let course = user.courses_current[i];
    //         if (course._id == target_id){
    //             found = true;
    //             user.courses_current[i] = req.body;
    //         }
    // }

    // if (found === false) {
    //     this.info.message += "Couldn't find course with this _id. "
    // }
    // else {
    //     this.info.message += "Successfully updated course with this _id. "
    // }

    user.courses_current[course_index] = req.body;
    this.info.message += "Successfully updated course with this _id. "
    

    saveUser(this.req, this.res, user, this.info);

}

update_course.run = update_course_handler.bind(update_course);




let delete_course = Object.create(controller_prototype);

function delete_course_handler (req, res) {

    this.req = req;
    this.res = res;

    let user = req.user;
    let course_index = req.course_index;

    user.courses_current.splice(course_index, 1);

    // const target_id = req.body._id;
    // //let result = await user_model.findOneAndDelete({"user.events_unresolved.id":target_id}).exec();
 
    // //Soon outsource this to a helper function which will have it's own error value for not being able to find a course by some _id
    // let found = false;
    // for (let i = 0; i<user.courses_current.length; i++){
    //     let event = user.courses_current[i];
    //     if (event._id == target_id){
    //         found = true;
    //         user.courses_current.splice(i,1);
    //     }
    // }

    // if (found === false) {
    //     this.info.message += "Couldn't find course with this _id. "
    // }
    // else {
    //     this.info.message += "Successfully deleted course with this _id. "
    // }

    this.info.message += "Successfully deleted course with this _id. "
   
    saveUser(this.req, this.res, user, this.info);

}

delete_course.run = delete_course_handler.bind(delete_course);




let read_userinfo = Object.create(controller_prototype);

function read_userinfo_handler(req, res) {

    this.req = req;
    this.res = res;

    let user = req.user;

    this.info.content = {
        "username" : user.username,
        "email": user.email,
        "date_time_created": user.date_time_created
    }
    this.info.message = "Returning all information about this user.";

    this.res.status(this.info.status);
    this.res.json(this.info);
}

read_userinfo.run = read_userinfo_handler.bind(read_userinfo);




//Doesn't really do ANYTHING
//Might add more functionality to this as I build the game aspect

let update_userinfo = Object.create(controller_prototype);

function update_userinfo_handler (req, res) {

    this.req = req;
    this.res =res;


    let user = req.user;

    /*
    IMPLEMENT LATER, WHEN YOU FIGURE OUT WHAT PARTS OF THE USER YOU WANT TO ALLOW TO BE CHANGEALBE
    */

}

update_userinfo.run = update_userinfo_handler.bind(update_userinfo);



let delete_user = Object.create(controller_prototype);

function delete_user_handler (req, res) {

    this.req = req;
    this.res = res;

    let user = req.user;
    
    const success = () => {
        this.info.message = "User deleted successfully. ";
        
        this.res.status(this.info.status);
        this.res.json(this.info);
    }

    const failure = (err) => {

        console.log(err);

        this.info.message = "Failed to delete user. ";

        this.info.status = 400; //idk temp
        
        this.res.status(this.info.status);
        this.res.json(this.info);
    }

    user_model.findOneAndDelete({"username":req.params.username}).exec()
    .then( success )
    .catch(failure)

}

delete_user.run = delete_user_handler.bind(delete_user);





let read_archived_events = Object.create(controller_prototype);

function read_archived_events_handler (req, res) {
    this.req = req;
    this.res = res;

    let user = req.user;
    let event_archive = req.event_archive;

    this.info.message += "Found event archive. ";

    this.info.content = event_archive.past_events;
        
    this.res.status(this.info.status);
    this.res.json(this.info);

    // const archive_id = user.event_archive;

    // const success = (archive) => {
    //     this.info.message += "Found event archive. ";

    //     this.info.content = archive.past_events;
        
    //     this.res.status(this.info.status);
    //     this.res.json(this.info);
    // }

    // const failure = (err) => {

    //     console.log(err);

    //     this.info.message = "Failed to find event archive. ";

    //     this.info.status = 400; //idk temp
        
    //     this.res.status(this.info.status);
    //     this.res.json(this.info);
    // }

    // //Can make finding the event archive middleware you dingus!!!

    // event_archive_model.findOne({"_id":archive_id}).exec()
    // .then(success)
    // .catch (failure)
}

read_archived_events.run = read_archived_events_handler.bind(read_archived_events);




//Hopefully this will work, no idea though!!!

let restore_archived_event = Object.create( controller_prototype);

function restore_archived_event_handler (req, res) {
    this.req = req;
    this.res = res;
    
    let user = req.user;
    let event_archive = req.event_archive;

    let i=0;
    event_archive.past_events.forEach((event)=> {

            if (event._id.toString() === restore_id){ //Changing from '===' to '=='

                archive.past_events.splice(i,1);
                user.restore_event(event); //User adds event back to unresolved then saves itself
               
            }
            i++;
    })

        saveArchive(this.req, this.res, archive, this.info);

    // const archive_id = user.event_archive;
    // //console.log('restore_id in func '+restore_id);

    // const success = (archive) => {
    //     let i=0;
    //     archive.past_events.forEach((event)=> {

    //         if (event._id.toString() === restore_id){ //Changing from '===' to '=='

    //             archive.past_events.splice(i,1);
    //             user.restore_event(event); //User adds event back to unresolved then saves itself
               
    //         }
    //         i++;
    //     })

    //     saveArchive(this.req, this.res, archive, this.info);
    // }

    // const failure = (err) => {
    //     console.log(err);

    //     this.info.status = 400;
    //     this.info.message = "Couldn't find associated archive";

    //     this.res.status(this.info.status);
    //     this.res.json(this.info);

    // }

    //  event_archive_model.findOne({"_id":archive_id}).exec()
    //         .then(success)
    //         .catch (failure)

}

restore_archived_event.run = restore_archived_event_handler.bind(restore_archived_event);










const controller = {create_user, login_user, add_event, 
    delete_unresolved_event, update_event, read_unresolved_events, 
    add_course, read_courses, update_course, delete_course,
    read_userinfo, update_userinfo, delete_user, 
    logout_user, read_archived_events, restore_archived_event};

export {controller};
