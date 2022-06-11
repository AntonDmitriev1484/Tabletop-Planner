
import res from 'express/lib/response.js';
import mongoose from 'mongoose';
let m = mongoose.models;

import connect from '../../connect_mongo.js';
import {user_model} from '../model/user_model.js'
import {event_archive_model, event_archive_schema} from "../model/event_archive_model.js"

import controller_prototype from './prototypes/controller_prototype.js'
import {controller} from './prototypes/controller.js'

import {saveUser, saveArchive} from './helpers/helpers.js'

import USER_ERR from './errors/user_errors.js'

global.session;

//We'll end up with one controller object per route

//Make an instance of the controller
let create_user = new controller();

//Create a controller function which will be run in the context of this object
//So they don't really work by themselves, but only when bound to a controller
function create_user_handler(req,res) {

    this.req = req;
    this.res = res;

    const event_archive = req.event_archive;

    this.info.message += "Event archived added. "

    let user = new user_model(req.body);

    //Gives each new user a ref to their event_archive
    user.events.past = event_archive._id;
    console.log(user.courses.past);

    saveUser(this.req, this.res, user, this.info);

} 


create_user.run = create_user_handler.bind(create_user);
//Simply setting the function doesn't do anything, you have to bind it







//let login_user = new controller();
let login_user = new controller();

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
        this.info.status = USER_ERR.INCORRECT_PASS.code;
        this.info.message += USER_ERR.INCORRECT_PASS.message;
    }

    this.res.status(this.info.status);
    this.res.json(this.info);

    this.info.reset();
}

login_user.run = login_user_handler.bind(login_user); 






const logout_user = (req, res) => { 
    //Will just clear the username field of our session
    req.session.username = "";
    global.session.username = "";
    req.session.destroy();

    return res.status(200).json({message:"User has successfully been logged out", success: true});

}




let add_event = new controller();

function add_event_handler (req, res) {

    this.req = req;
    this.res = res;

    let user = req.user;

    
    let schoolwork = m.schoolwork_model(req.body);

    switch(req.body.type) {
        //Might not be necessary, but I think this at least enforces
        //that the format is correct before setting schoolwork.work property
        case "homework":
            schoolwork.work = m.homework_model(req.body.work);
            break;
        case "exam":
            schoolwork.work = m.exam_model(req.body.work);
            break;
        case "project":
            schoolwork.work = m.project_model(req.body.work);
            break;
        case "paper":
            schoolwork.work = m.paper_model(req.body.work);
            break;
        default:
            break;
      }
    //let homework = m.homework_model(req.body);

    user.events.active.push(schoolwork);
    
    this.info.message += "Added event to list of active events. ";

    saveUser(this.req, this.res, user, this.info);
}

add_event.run = add_event_handler.bind(add_event);






let delete_unresolved_event = new controller();

function delete_unresolved_event_handler (req, res) {

    this.req = req;
    this.res = res;

    let user = req.user;
    let event_index = req.event_index;

    user.events.active.splice(event_index,1);

    this.info.message += "Event successfully deleted. ";
    saveUser(this.req, this.res, user, this.info);


}

delete_unresolved_event.run = delete_unresolved_event_handler.bind(delete_unresolved_event);


//Stopped here to change middleware


let update_event = new controller();

function update_event_handler(req, res) {
    this.req = req;
    this.res = res;

    let user = req.user;
    let event_index = req.event_index;


    user.events.active[event_index] = this.req.body;

    // if (this.req.body.work.progress >= 100){
    //             //IF YOU'RE HAVING A BUG WHERE IT DOESN"T UPDATE THIS IS PROBABLY THE SOLUTION
    //             // user.events_unresolved[i] = req.body;
                
    //     user.events.active.splice(event_index,1);
    //     user.archive_event(this.req.body); //So that the archive will get the most recently updated version

    // }

    this.info.message += "Active event has been updated. ";

    saveUser(this.req, this.res, user, this.info);
}


update_event.run = update_event_handler.bind(update_event);







let read_unresolved_events = new controller();

function read_unresolved_events_handler (req, res) {
    this.req = req;
    this.res = res;


    let user = req.user;

    this.info.message = "Returning all unresolved events for user.";

    //User unresolved events will be sent under a newly added content field
    this.info.content = user.events.active;


    this.res.status(this.info.status);
    this.res.json(this.info);

}

read_unresolved_events.run = read_unresolved_events_handler.bind(read_unresolved_events);






let add_course = new controller();

function add_course_handler (req, res) {
    this.req = req;
    this.res = res;

    let user = req.user;
    
    let course = new m.course_model(req.body);
    user.courses.active.push(course);

    this.info.message += "Course added successfully. "

    saveUser(this.req, this.res, user, this.info);

}

add_course.run = add_course_handler.bind(add_course);



let read_courses = new controller();

function read_courses_handler (req, res) {

    this.req = req;
    this.res = res;
    
    let user = req.user;

    this.info.message = "Returning all current courses for this user.";
    this.info.content = user.courses.active;

    res.status(this.info.status);
    res.json(this.info);

}

read_courses.run = read_courses_handler.bind(read_courses);





let update_course = new controller();

function update_course_handler(req, res) {

    this.req = req;
    this.res =res;

    let user = req.user;

    let course_index = req.course_index;

    user.courses.active[course_index] = req.body;
    this.info.message += "Successfully updated course with this _id. "
    

    saveUser(this.req, this.res, user, this.info);

}

update_course.run = update_course_handler.bind(update_course);




let delete_course = new controller();

function delete_course_handler (req, res) {

    this.req = req;
    this.res = res;

    let user = req.user;
    let course_index = req.course_index;

    user.courses.active.splice(course_index, 1);

    this.info.message += "Successfully deleted course with this _id. "
   
    saveUser(this.req, this.res, user, this.info);

}

delete_course.run = delete_course_handler.bind(delete_course);




let read_userinfo = new controller();

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

let update_userinfo = new controller();

function update_userinfo_handler (req, res) {

    this.req = req;
    this.res =res;


    let user = req.user;

    /*
    IMPLEMENT LATER, WHEN YOU FIGURE OUT WHAT PARTS OF THE USER YOU WANT TO ALLOW TO BE CHANGEALBE
    */

}

update_userinfo.run = update_userinfo_handler.bind(update_userinfo);



let delete_user = new controller();

function delete_user_handler (req, res) {
    //Also want this to delete the event archive associated with the user

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






let read_archived_events = new controller();

function read_archived_events_handler (req, res) {
    this.req = req;
    this.res = res;

    let user = req.user;
    let event_archive = req.event_archive;

    this.info.message += "Found event archive. ";

    this.info.content = event_archive.past_events;
        
    this.res.status(this.info.status);
    this.res.json(this.info);

}

read_archived_events.run = read_archived_events_handler.bind(read_archived_events);




//Doesn't work. Do later!

let restore_archived_event = Object.create( controller_prototype);

function restore_archived_event_handler (req, res) {
    this.req = req;
    this.res = res;
    
    let user = req.user;
    let event_archive = req.event_archive;

    let restore_id = req.body._id;

    let i=0;
    event_archive.past_events.forEach((event)=> {

            if (event._id.toString() === restore_id){ //Changing from '===' to '=='

                event_archive.past_events.splice(i,1);
                user.restore_event(event); //User adds event back to unresolved then saves itself
               
            }
            i++;
    })

    //Also need to actually save user!!!! //Actually maybe dont???

    saveArchive(this.req, this.res, event_archive, this.info);

}

restore_archived_event.run = restore_archived_event_handler.bind(restore_archived_event);


let shift_incomplete_events = Object.create( controller_prototype);

function shift_incomplete_events_handler (req, res) {

    this.req = req;
    this.res = res;

    let user = req.user;
    let event_archive = req.event_archive;

    let current_date = new Date();

    for (let i = 0 ; i < user.events.active.length; i++){

        let due_date = new Date(user.events.active[i].work.dt_due); //Passing in the ISO string to the constructor
        
        console.log(current_date.toString())
        console.log(due_date.toString())


        if (current_date > due_date) {
            if (user.events.active[i].work.progress < 100) {
                user.events.active[i].dt_focus = current_date.toISOString();
            }
        }
    }
    
    user.markModified('events.active'); //Apparently you have to do this?
    //for it to save. But why specifically now? I don't really understand
    //it works fine for all of update_event

    saveUser(this.req, this.res, user, this.info);

}

shift_incomplete_events.run = shift_incomplete_events_handler.bind(shift_incomplete_events);


let archive_completed_events = Object.create( controller_prototype);

function archive_completed_events_handler (req, res) {
    this.req = req;
    this.res = res;

    let user = req.user;
    let event_archive = req.event_archive;

    let active_events = user.events.active;

    for (let i = 0; i< active_events.length; i++) {

        let event = active_events[i];

        if (event.work.progress >= 100 || event.work.complete) {
            
            event = active_events.splice(i,1);
            user.archive_event(event); //So that the archive will get the most recently updated version
       
        }

    }
}




let hoist_incomplete_events = Object.create( controller_prototype);

function hoist_incomplete_events_handler (req, res) {
    //Hoists all incompleted active events to some
    //Keeps them as active, since they are incomplete
    //Requires dt_focus to be in the body

    this.req = req;
    this.res = res;

    let user = req.user; //Need to go through user load middleware

    let active_events = user.events.active;
    let event;

    let hoist_date_str = req.body.dt_focus;

    for (let i = 0; i< active_events.length; i++) {

        event = active_events[i];
        
        if (!(event.work.progress >= 100 || event.work.complete)) {
            
            event.dt_focus = new Date(hoist_date_str);
        }

    }

    user.markModified('events.active'); //Apparently you have to do this?

    saveUser(this.req, this.res, user, this.info);

}

hoist_incomplete_events.run = hoist_incomplete_events.bind(hoist_incomplete_events)



const controllers = {create_user, login_user, add_event, 
    delete_unresolved_event, update_event, read_unresolved_events, 
    add_course, read_courses, update_course, delete_course,
    read_userinfo, update_userinfo, delete_user, 
    logout_user, read_archived_events, restore_archived_event,
    shift_incomplete_events};

export {controllers};
