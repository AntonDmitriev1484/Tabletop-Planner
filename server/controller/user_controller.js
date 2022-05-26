
import res from 'express/lib/response.js';
import mongoose from 'mongoose';
let m = mongoose.models;

import connect from '../../connect_mongo.js';
import {user_model} from '../model/user_model.js'
import {event_archive_model, event_archive_schema} from "../model/event_archive_model.js"
import {university_model, university_schema} from "../model/university_model.js"

import controller_prototype from './prototypes/controller_prototype.js'

import {saveUser, get_user, run_on_unresolved_event} from './helpers/helpers.js'

let session;



//We'll end up with one controller object per route

//Make an instance of the controller
let create_user = Object.create(controller_prototype);

//Create a controller function which will be run in the context of this object
//So they don't really work by themselves, but only when bound to a controller
function create_user_handler(req,res) {

    this.req = req;
    this.res = res;

    let event_archive = new event_archive_model();

    const success = () => {
        let user = new user_model(req.body);

        //Gives each new user a ref to their event_archive
        user.event_archive = event_archive.id;

        this.info.message += "Event archived added. "

        saveUser(this.req, this.res, user, this.info);
    }

    event_archive.save().then( success ).catch( this.handle_error )

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
        session=req.session;
        session.username=req.body.username; //On login we set username in the session object
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


//SESSION AUTHENTICATION MIDDLEWARE
//protects the endpoints that we need to be behind login
const check_session = (req, res, next) => {
    console.log('checking session');
    console.log( session.username);
    if (session.username === req.params.username){
        next()
    }
    else {
        return res.status(400).json({message:"You are not authorized to manipulate this user's information"});
    }
}

async function load_user_by_username (req, res, next) {
    console.log('loading user');

    let username = req.body.username;
    let user = await user_model.findOne({"username": username}).exec();

    if (user !== null) {
        req.user = user;
        next();
    }
    else {
        return res.status(202).json({status:202, message:"User with this username doesn't exist."});
    }
}

const logout_user = (req, res) => {
    //Will just clear the username field of our session
    req.session.username = "";
    session.username = "";
    req.session.destroy();

    return res.status(200).json({message:"User has successfully been logged out", success: true});

}





let add_event = Object.create(controller_prototype);

function add_event_handler (req, res) {

    this.req = req;
    this.res = res;

    const success = (user) => {
        if (user !== null) { //If we were able to find a user

            let homework = m.homework_model(req.body);
            user.events_unresolved.push(homework);

            saveUser(this.req, this.res, user, this.info);
        }
        else {
            this.info.status = 202; //idk man
            this.info.message = "User does not exist";

            this.res.status(this.info.status);
            this.res.json(this.info);
        }
    }
    get_user(req.params.username).then(success).catch(this.handle_error);
}

add_event.run = add_event_handler.bind(add_event);

add_event.error_status = 402; //Couldn't find user
add_event.error_message = "Error thrown while searching database for user. ";





let delete_unresolved_event = Object.create(controller_prototype);

function delete_unresolved_event_handler (req, res) {

    this.req = req;
    this.res = res;

    const success = (user) => {
        if (user !== null) {

            const found = () => {
                user.events_unresolved.splice(i,1);
                saveUser(this.req, this.res, user, this.info);
            }

            run_on_unresolved_event(this.req, this.res, user, found);

        }
        else {
            this.info.status = 202; //idk man
            this.info.message = "User does not exist";

            this.res.status(this.info.status);
            this.res.json(this.info);
        }
           
    }
    get_user(req.params.username).then(success).catch(this.handle_error);

}
//I think get_user should also just handle checking if the user object is null

delete_unresolved_event.run = delete_unresolved_event_handler.bind(delete_unresolved_event);
delete_unresolved_event.error_code = 400;
delete_unresolved_event.error_message = "Temp";




let update_event = Object.create(controller_prototype);

function update_event_handler(req, res) {
    this.req = req;
    this.res = res;

    const success = (user) => {
        if (user !== null) { //If we were able to find a user

                const found = () => {
                    user.events_unresolved[i] = this.req.body;
                        //console.log(req.body.progress);
                        if (req.body.progress >= 100){
                            //IF YOU'RE HAVING A BUG WHERE IT DOESN"T UPDATE THIS IS PROBABLY THE SOLUTION
                            // user.events_unresolved[i] = req.body;
                            
                            user.events_unresolved.splice(i,1);
                            user.archive_event(req.body); //So that the archive will get the most recently updated version
                            saveUser(this.req, this.res, user, this.info);
                        }
                }

                run_on_unresolved_event(this.req, this.res, user, found);

        }
        else {
            this.info.status = 202; //idk man
            this.info.message = "User does not exist";

            this.res.status(this.info.status);
            this.res.json(this.info);
        }
    }
    get_user(req.params.username).then(success).catch(this.handle_error);
}


update_event.run = update_event_handler.bind(update_event);
update_event.error_code = 400;
update_event.error_message = "Temp";






let read_unresolved_events = Object.create(controller_prototype);

function read_unresolved_events_handler (req, res) {
    this.req = req;
    this.res = res;

    const success = () => {

        if (user !== null) {
            this.info.status = 200;
            this.info.message = "Returning all unresolved events for user";

            //User unresolved events will be sent under a newly added content field
            this.info.content = user.events_unresolved;
        }
        else {
            this.info.status = 202; //idk man
            this.info.message = "User does not exist";
        }
        this.res.status(this.info.status);
        this.res.json(this.info);
    }
    get_user(req.params.username).then( success ).catch (this.handle_error);
}

read_unresolved_events.run = read_unresolved_events_handler.bind(read_unresolved_events);
read_unresolved_events.error_code = 400;
read_unresolved_events.error_message = "Temp";






const add_course = async (req, res) => {
    let status = 200;
    let response_message = "";
    let success = false;

    console.log("Adding course ");
    console.log(req.body);
    try {
        let user = await get_user(req.params.username);
        if (user !== null) { //If we were able to find a user

            let pcourse = new m.pcourse_model(req.body);
            user.courses_current.push(pcourse);

            try {
                await user.save();
                status = 200;
                success = true;
                response_message = "Course added to this user successfully";
            }
            catch (err) {
                console.log(err);
                status = 400; //Figure out error codes later
                response_message = "Error Name: "+err.name+".\n Error Message: "+err.message;
            }
        }
        else {
            status = 201; //idk man
            response_message = "User does not exist";
        }
    }
    catch (err) {
        console.log(err);
        status = 400; //Figure out error codes later
        response_message = "Error Name: "+err.name+".\n Error Message: "+err.message;
    }

    if (status === 200){ //TEMPORARY FIX TO BAD ERROR CODES
        res.status(status).json({message: response_message,  success: true});
    }
    else {
        res.status(status).json({message: response_message, success: false});
    }
}


const read_courses = async (req, res) => {

    const username = req.params.username;
    let success = false;

    function func (user) { //When defined out here, the function gets our req and res objects from this scope
        let status = 200;
        let response_message = "";
        let content = "";
        
        if (user !== null) { //If we were able to find a user

            status = 200;
            success =true;
            response_message = "Returning all current courses for this user";
            content = user.courses_current;
        
        }
        else {
            status = 202; //idk man
            response_message = "User does not exist";
        }

        if (status === 200){ //TEMPORARY FIX TO BAD ERROR CODES
            res.status(status).json({message: response_message, courses: content, success: true});
        }
        else {
            res.status(status).json({message: response_message, courses: content, success: false});
        }
    }

    run_func_on_user( username, func);
   return res
}


const update_course = async (req, res) => {

    let status = 200;
      let response_message = "";
      let success= false;
      try {
          let user = await get_user(req.params.username);
          if (user !== null) { //If we were able to find a user
              const target_id = req.body._id;
                 //let result = await user_model.findOneAndDelete({"user.events_unresolved.id":target_id}).exec();
              
              let found = false;

              for (let i = 0; i<user.courses_current.length; i++){
                  let event = user.courses_current[i];
                  if (event._id == target_id){
                      found = true;
                      user.courses_current[i] = req.body;
                  }
              }
  
              if (found) {
                  try {
                      await user.save();
                      status = 200; //idk man
                      success = true;
                      response_message = "Successfully updated course by _id";
                  }
                  catch (err) {
                      console.log(err);
                      status = 400; //Figure out error codes later
                      response_message = "Error Name: "+err.name+".\n Error Message: "+err.message;
                  }
              }
              else {
                  status = 201; //idk man
                  response_message = "Couldn't find event with this _id";
              }
          }
          else {
              status = 202; //idk man
              response_message = "User does not exist";
          }
      }
      catch (err) {
          console.log(err);
          status = 400; //Figure out error codes later
          response_message = "Error Name: "+err.name+".\n Error Message: "+err.message;
      }

        if (status === 200){ //TEMPORARY FIX TO BAD ERROR CODES
            res.status(status).json({message: response_message,  success: true});
        }
        else {
            res.status(status).json({message: response_message,  success: false});
        }
  }


  const delete_course = async (req, res) => {

    let status = 200;
    let response_message = "";
    
    try {
        let user = await get_user(req.params.username);
        if (user !== null) { //If we were able to find a user
            const target_id = req.body._id;
               //let result = await user_model.findOneAndDelete({"user.events_unresolved.id":target_id}).exec();
            
            let found = false;
            for (let i = 0; i<user.courses_current.length; i++){
                let event = user.courses_current[i];
                if (event._id == target_id){
                    found = true;
                    user.courses_current.splice(i,1);
                }
            }

            if (found) {
                try {
                    await user.save();
                    status = 200; //idk man
                    response_message = "Successfully removed course by _id";
                }
                catch (err) {
                    console.log(err);
                    status = 400; //Figure out error codes later
                    response_message = "Error Name: "+err.name+".\n Error Message: "+err.message;
                }
            }
            else {
                status = 201; //idk man
                response_message = "Couldn't find event with this _id";
            }

        
        }
        else {
            status = 202; //idk man
            response_message = "User does not exist";
        }
    }
    catch (err) {
        console.log(err);
        status = 400; //Figure out error codes later
        response_message = "Error Name: "+err.name+".\n Error Message: "+err.message;
    }

    if (status === 200){ //TEMPORARY FIX TO BAD ERROR CODES
        res.status(status).json({message: response_message, success: true});
    }
    else {
        res.status(status).json({message: response_message, success: false});
    }

}


const read_userinfo = async (req, res) => {

    //Will exclude things like pass_hash from the res json, but will send everything else

    const username = req.params.username;

    function func (user) { //When defined out here, the function gets our req and res objects from this scope
        let status = 200;
        let response_message = "";
        let content = "";
        
        if (user !== null) { //If we were able to find a user

            status = 200;
            response_message = "Returning all current courses for this user";
            content = {
                "username" : user.username,
                "email": user.email,
                "date_time_created": user.date_time_created
            };
        
        }
        else {
            status = 202; //idk man
            response_message = "User does not exist";
        }

        if (status === 200){ //TEMPORARY FIX TO BAD ERROR CODES
            res.status(status).json({message: response_message, user_info: content, success: true});
        }
        else {
            res.status(status).json({message: response_message, user_info: content, success: false});
        }
    }

    run_func_on_user( username, func);
   return res
}


//Doesn't really do ANYTHING
//Might add more functionality to this as I build the game aspect
const update_userinfo = async (req, res) => {

    let status = 200;
      let response_message = "";
      try {
          let user = await get_user(req.params.username);
          if (user !== null) { //If we were able to find a user
              const target_id = req.body._id;
                 
              let found = true;

              //user.email = req.body.emal;
  
              if (found) {
                  try {
                      await user.save();
                      status = 200; //idk man
                      response_message = "Successfully updated user";
                  }
                  catch (err) {
                      console.log(err);
                      status = 400; //Figure out error codes later
                      response_message = "Error Name: "+err.name+".\n Error Message: "+err.message;
                  }
              }
              else {
                  status = 201; //idk man
                  response_message = "Couldn't find event with this _id";
              }
          }
          else {
              status = 202; //idk man
              response_message = "User does not exist";
          }
      }
      catch (err) {
          console.log(err);
          status = 400; //Figure out error codes later
          response_message = "Error Name: "+err.name+".\n Error Message: "+err.message;
      }
      if (status === 200){ //TEMPORARY FIX TO BAD ERROR CODES
        res.status(status).json({message: response_message, success: true});
    }
    else {
        res.status(status).json({message: response_message, success: false});
    }
  }


const delete_user = async (req, res) => {

    let status = 200;
    let response_message = "";
    // try {
    //     let user = await get_user(req.params.username);

        try {
            await user_model.findOneAndDelete({"username":req.params.username}).exec();

            status = 200; //idk man
            response_message = "Successfully deleted user";
        }
        catch (err) {
            console.log(err);
            status = 400; //Figure out error codes later
            response_message = "Error Name: "+err.name+".\n Error Message: "+err.message;
        }


        if (status === 200){ //TEMPORARY FIX TO BAD ERROR CODES
            res.status(status).json({message: response_message, success: true});
        }
        else {
            res.status(status).json({message: response_message, success: false});
        }

}

const define_university = async (req, res) => {
    // let university_name = req.params.universityname;
    let university = university_model(req.body);
    let status  = 200;
    let response_message = "";

    try {
            await university.save();
            status = 200;
            response_message = "University has been successfully created";

        }
        catch (err){
            console.log(err);
            status = 400; //Figure out error codes later
            response_message = "Error Name: "+err.name+".\n Error Message: "+err.message;
        
    }

    if (status === 200){ //TEMPORARY FIX TO BAD ERROR CODES
        res.status(status).json({message: response_message, success: true});
    }
    else {
        res.status(status).json({message: response_message, success: false});
    }
    return res;
}

const read_university_info = async (req,res) => {
    let university_name = req.params.universityname.replaceAll("_"," ");
    //the .replace undoes changes made on the frontend to the string so that it could
    //be sent through the url
    console.log(university_name);
    let status = 200;
    let body = {message:"", content:""};


    let model = university_model;

    const query = {"name":university_name};


    const found = (university) => {
        console.log('in found');
        body.content = university;

        console.log(body.content);
        status = 200; //idk man
        body.message = "Returning all information about this university";
    }

    const not_found = (err) => {
        console.log(err);
        status = 400; //Figure out error codes later
        body.message = "Error Name: "+err.name+".\n Error Message: "+err.message;
    }

    await fetch_from_db(model, query, found, not_found);

    if (status === 200){ //TEMPORARY FIX TO BAD ERROR CODES
        body.success = true;
    }
    else {
       body.success = false;
    }

    res.status(status).json(body);
}


const create_course_for_university = async (req,res) => {
    let university_name = req.params.universityname.replaceAll("_"," ");
    let status = 200;
    let body = {message:""};


    let model = university_model;

    console.log(university_name);
    const query = {"name":university_name};


    const found = async (university) => {

        let course = m.course_model(req.body.course);
        university.courses.push(course);

        university.save();

        status = 200; //idk man
        body.message = "Course has successfully been added to this university";
    }

    const not_found = (err) => {
        console.log("Not found");
        
        body.message = "Not found";
    }

    await fetch_from_db(model, query, found, not_found);

    if (status === 200){ //TEMPORARY FIX TO BAD ERROR CODES
        body.success = true;
    }
    else {
       body.success = false;
    }

    res.status(status).json(body);
}






const fetch_from_db = async (model, query, found, not_found) => {
    try {
        console.log(query);
         let data = await model.findOne(query);
         if (data !== null) {
            found(data);
            try {
               await data.save();
            }
            catch (err) {
                console.log(err);
            }
         }
         else {
             not_found("Not found");
         }

    }
    catch (err) {
        console.log(err);
        status = 400; //Figure out error codes later
        body.message = "Error Name: "+err.name+".\n Error Message: "+err.message;
        // not_found(err);
    }
}




const read_archived_events = async (req, res) => {

    const username = req.params.username;
    let success = false;

    async function func (user) { //When defined out here, the function gets our req and res objects from this scope
        let status = 200;
        let response_message = "";
        let content = "";
        
        if (user !== null) { //If we were able to find a user

            const archive_id = user.event_archive;

            try {
                const archive = await event_archive_model.findOne({"_id":archive_id}).exec();
                console.log(archive);

                status = 200;
                success = true;
                response_message = "Returning all archived events for this user";
                content = archive.past_events;
                
            }
            catch (err) {
                status = 400; //idk man
                response_message = "SOmething went wrong lmao";
            }
        
        }
        else {
            status = 202; //idk man
            response_message = "User does not exist";
        }

        //return res.status(status).json({message: response_message, events: content});
        if (status === 200){ //TEMPORARY FIX TO BAD ERROR CODES
            res.status(status).json({message: response_message, events: content, success: true});
        }
        else {
            res.status(status).json({message: response_message, events: content, success: false});
        }
    }

    //res = run_func_on_user( username, res, func); //Confused lexical scoping

    run_func_on_user( username, func);
   //return  run_func_on_user( username, func);
   return res
}

const restore_archived_event = async (req, res) => {

    const username = req.params.username;
    const restore_id = req.body._id;
    let success = false;

    
    console.log('restore_id outside func '+restore_id);

    async function func (user) { //When defined out here, the function gets our req and res objects from this scope
        let status = 200;
        let response_message = "";
        let content = "";
        
        if (user !== null) { //If we were able to find a user

            const archive_id = user.event_archive;

            console.log('restore_id in func '+restore_id);

            try {
                let archive = await event_archive_model.findOne({"_id":archive_id}).exec();
                
                //Find this user's archive
                //Then iterate over each archived event until
                //you find the one with a matching id

                //Can't start i at 0, 
                let i=0;
                archive.past_events.forEach((event)=> {

                    // console.log('MongoDb '+event._id.toString()+' vs '+' req '+restore_id);
                    // console.log('i '+i);
                    if (event._id.toString() === restore_id){ //Changing from '===' to '=='

                        archive.past_events.splice(i,1);
                        user.restore_event(event); //User adds event back to unresolved then saves itself
                       
                    }
                    i++;
                })

                
                await archive.save(); //archive saves itself

                status = 200;
                success = true;
                response_message = "Archived event has been restored and moved to user's urnesolved list";
                content = archive.past_events;
                
            }
            catch (err) {
                status = 400; //idk man
                response_message = "SOmething went wrong lmao";
            }
        
        }
        else {
            status = 202; //idk man
            response_message = "User does not exist";
        }

        //return res.status(status).json({message: response_message, events: content});
        if (status === 200){ //TEMPORARY FIX TO BAD ERROR CODES
            res.status(status).json({message: response_message, events: content, success: true});
        }
        else {
            res.status(status).json({message: response_message, events: content, success: false});
        }
    }

    //res = run_func_on_user( username, res, func); //Confused lexical scoping

    run_func_on_user( username, func);
   //return  run_func_on_user( username, func);
   return res
}


const generic_read = async() => {
    let status = 200;
    let body = {message:"", content:""};

    



    res.status(status).json(body);
}


const controller = {create_user, login_user, add_event, 
    delete_unresolved_event, update_event, read_unresolved_events, 
    add_course, read_courses, update_course, delete_course,
    read_userinfo, update_userinfo, delete_user, check_session, 
    logout_user, read_university_info, create_course_for_university, define_university,
    read_archived_events, restore_archived_event, load_user_by_username};
export {controller};


























































//Dumb scoping experiment
async function run_func_on_user (username, func) {

    try {
        let user = await user_model.findOne({"username": username}).exec();
        //Note: left part of json should be wrapped in quotes "" to distinguish it from the variable
        //Also, make sure to use .exec() to ACTUALLY EXECUTE THE FUCKING QUERY MORON
        func(user); //Need to pass in response object because scoping is being strange

    }
    catch (err) {
        console.log(err);
        let status = 400; //Figure out error codes later
        let response_message = "Error Name: "+err.name+".\n Error Message: "+err.message;
        res.status(status).json({message: response_message});
    }
        
}

//Dumb scoping experiment
async function linear_search_unresolved_event (user, target_id, on_find){

    let found = false;
    
    let event = "";


    //Not super efficient, but starting from the user is probably more efficient
    //than mongo starting from the root of the collection
    //Linear search will be over at most 15 or so items since the list is activley maintained
    for (let i = 0; i<user.events_unresolved.length; i++){
        event = user.events_unresolved[i];
        if (event._id == target_id){
            found = true;
            break;
        }
    }

    if (found) {
        await on_find(event);

    }
    else {
        status = 201; //idk man
        response_message = "Couldn't find event with this _id";

    }

    res.status(status).json({message: response_message});
}
































































//This idea was from MERN Projects Textbook
//Honestly just make this into a normal function which you'll call within each method
//No need to do any super fancy stuff
// const user_parameter_callback = async (req,res,next)=> {
//     //This is a callback which will trigger whenever the username parameter is included
//     //in the url.

//     //This will get the username from the request, and use it to query the database
//     //to return the correct user model object to the next() function.

//     let username = req.params.username;
//     let status = 200;
//     try {
//         let user = await user_model.findOne({"username": username}).exec();

//         if (user){
//             next(); //The req, res objects we have in this method automatically get passed onto next
//         }
//         else {
//             status = 202; //idk man
//             response_message = "User does not exist";
//         }
//     }
//     catch (err){
//         console.log(err);
//         status = 400; //Figure out error codes later
//         response_message = "Error Name: "+err.name+".\n Error Message: "+err.message;
    
//     }

// }


//Wasting time doing dumb scoping things

// const update_event = async (req, res) => {


//     async function func(user) { //Has req and res objects from external scope

//         let status = 200;
//         let response_message = "";

        
//         async function on_find( event){ //has req and res objects from grandparent scope, has user object from parent scope
//             let status = 200;
//             try {
//                 //user.events_unresolved[i] = req.body;
//                 event = req.body;
//                 await user.save();
//                 status = 200; //idk man
//                 response_message = "Successfully updated event by _id";
//             }
//             catch (err) {
//                 console.log(err);
//                 status = 400; //Figure out error codes later
//                 response_message = "Error Name: "+err.name+".\n Error Message: "+err.message;
//             }
         
//             res.status(status).json({message: response_message});
//         }



//         if (user !== null) { //If we were able to find a user
//             await linear_search_unresolved_event(user, req.body._id, on_find);
        
//         }
//         else {
//             status = 202; //idk man
//             response_message = "User does not exist";
//         }

//         res.status(status).json({message: response_message});

//     }

//     await run_func_on_user(req.params.username, res, func);
    
//     return res;

//     // res = run_func_on_user(req.params.username, res, async (user, res) => {
//     //     let status = 200;
//     //     let response_message = "";

//     //     if (user !== null) { //If we were able to find a user
//     //         // const target_id = req.body._id;  
//     //         // let found = false;
            
//     //         // //Not super efficient, but starting from the user is probably more efficient
//     //         // //than mongo starting from the root of the collection
//     //         // //Linear search will be over at most 15 or so items since the list is activley maintained
//     //         // for (let i = 0; i<user.events_unresolved.length; i++){
//     //         //     let event = user.events_unresolved[i];
//     //         //     if (event._id == target_id){
//     //         //         found = true;
//     //         //         user.events_unresolved[i] = req.body;
//     //         //     }
//     //         // }

//     //         // if (found) {
//     //         //     try {
//     //         //         await user.save();
//     //         //         status = 200; //idk man
//     //         //         response_message = "Successfully updated event by _id";
//     //         //     }
//     //         //     catch (err) {
//     //         //         console.log(err);
//     //         //         status = 400; //Figure out error codes later
//     //         //         response_message = "Error Name: "+err.name+".\n Error Message: "+err.message;
//     //         //     }
//     //         // }
//     //         // else {
//     //         //     status = 201; //idk man
//     //         //     response_message = "Couldn't find event with this _id";
//     //         // }

//     //         const on_find = async () => {
//     //             try {
//     //                 user.events_unresolved[i] = req.body;
//     //                 await user.save();
//     //                 status = 200; //idk man
//     //                 response_message = "Successfully updated event by _id";
//     //             }
//     //             catch (err) {
//     //                 console.log(err);
//     //                 status = 400; //Figure out error codes later
//     //                 response_message = "Error Name: "+err.name+".\n Error Message: "+err.message;
//     //             }
//     //         }

//     //         linear_search_unresolved_event(user, req.body._id, on_find)
        
//     //     }
//     //     else {
//     //         status = 202; //idk man
//     //         response_message = "User does not exist";
//     //     }

//     //     return res.status(status).json({message: response_message});
//     // })

    
//     //return res;
// }