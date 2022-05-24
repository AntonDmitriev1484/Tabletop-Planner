
import res from 'express/lib/response.js';
import mongoose from 'mongoose';
let m = mongoose.models;

import connect from '../../connect_mongo.js';
import {user_model} from '../model/user_model.js'
import {event_archive_model, event_archive_schema} from "../model/event_archive_model.js"
import {university_model, university_schema} from "../model/university_model.js"

import controller_prototype from './prototypes/controller_prototype.js'

let session;


const saveUser = (req, res, user, send) => { //Assuming that this is the last thing we call in most of our controllers

    user.save().then( () => {
        send.response_message += "User has been successfully saved. "

        res.status(send.status)
        res.json(send);

        send.reset();
    })
    .catch((err) => {
        console.log(err);

        send.status = 400;
        send.response_message += "User save failed. ";
        
        res.status(send.status)
        res.json(send);

        send.reset();
    })
        
}

// const error_response = (res, send, status, message) => {
//     //Assumes that the Express res object is being passed by reference
//     send.status = status;
//     send.response_message += message;
//     res.status(send.status);
//     res.json(send);
// }

//Ok so it was being fucking braindead because for some reason its in strict mode
//No idea how to turn strict mode off, not doing the scoping approach anymore

//var isStrict = (function() { return !this; })();

let create_user_controller = Object.create(controller_prototype);

create_user_controller.controller_function = create_user;

create_user_controller.error_status = 400;
create_user_controller.error_message = "Couldn't create archive";

function create_user(req,res) {

    this.req = req;
    this.res = res;

    let event_archive = new event_archive_model();

    const success = () => {
        let user = new user_model(req.body);

        //Gives each new user a ref to their event_archive
        user.event_archive = event_archive.id;

        this.send.response_message += "Event archived added. "
        saveUser(this.req, this.res, user, this.send);
    }

    event_archive.save().then( success ).catch(this.handle_error)

}


//THIS VERSION WORKS!!!

// function create_user(req,res) {

//     let send = {
//         status: 200,
//         response_message: "",
//         success: true
//     }

//     let event_archive = new event_archive_model();

//     const a = () => {
//         let user = new user_model(req.body);

//         //Gives each new user a ref to their event_archive
//         user.event_archive = event_archive.id;

//         send.response_message += "User created, event archived added. "
//         saveUser(req, res, user, send);
//     }

//     const handle_error = (err) => {
//         console.log(err);
//         error_response(res, send, 400, "Couldn't create event archive.")
//     }

//     event_archive.save()
//     .then(
//         a()
//     )
//     .catch(handle_error)


// }



//By externally binding create_user() to test_obj, we can get it to retain it's scop in the this object
//Note that this doesn't work when defining the function within the object. I love JS!



const login_user = async (req,res) => {

    
    // console.log("received json: ");
    // console.log(req.header);
    // console.log(req.body);

    let username = req.body.username;
    let pass_attempt = req.body.password;
    let success = false;

    // console.log(username+" "+pass_attempt);

    //Need to query mongodb by username

    let status = 200;
    let response_message = "";
    try {
        let user = await get_user(username);


        if (user !== null) { //If we were able to find a user

            if (user.check_pass(pass_attempt)){
                status = 200;
                session=req.session;
                session.username=req.body.username;
                success = true;
                //On login we set username in the session object

                response_message = "User logged in successfully";
            }
            else {
                status = 201; //idk man
                response_message = "User exists but password is incorrect";
            }
        }
        else {
            status = 202; //idk man
            response_message = "User does not exist";
        }

    }
    catch (err){
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

//SESSION AUTHENTICATION MIDDLEWARE
//protects the endpoints that we need to be behind login
const check_session = (req, res, next) => {
    console.log('in middleware');
    if (session.username === req.params.username){
        next()
    }
    else {
        return res.status(400).json({message:"You are not authorized to manipulate this user's information"});
    }
}

const logout_user = (req, res) => {
    //Will just clear the username field of our session
    req.session.username = "";
    session.username = "";
    req.session.destroy();

    return res.status(200).json({message:"User has successfully been logged out", success: true});

}

const add_event = async (req,res) => {

    let status = 200;
    let response_message = "";
    let success = false;

    try {
        let user = await get_user(req.params.username);
        if (user !== null) { //If we were able to find a user
            let homework = m.homework_model(req.body);

            user.events_unresolved.push(homework);

            try {
                await user.save();
                status = 200;
                response_message = "Event added to planner successfully";
                success = true;
            }
            catch (err) {
                console.log(err);
                status = 400; //Figure out error codes later
                response_message = "Error Name: "+err.name+".\n Error Message: "+err.message;
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

const delete_unresolved_event = async (req, res) => {

    console.log('made it to delete handler');
    let status = 200;
    let response_message = "";
    let success = false;

    console.log(req.body);

    try {
        let user = await get_user(req.params.username);
        if (user !== null) { //If we were able to find a user
            const target_id = req.body._id;
               //let result = await user_model.findOneAndDelete({"user.events_unresolved.id":target_id}).exec();
            
            let found = false;
            
            //Not super efficient, but starting from the user is probably more efficient
            //than mongo starting from the root of the collection
            //Linear search will be over at most 15 or so items since the list is activley maintained
            for (let i = 0; i<user.events_unresolved.length; i++){
                let event = user.events_unresolved[i];
                if (event._id == target_id){
                    found = true;
                    user.events_unresolved.splice(i,1);
                }
            }

            if (found) {
                try {
                    await user.save();
                    status = 200; //idk man
                    success = true;
                    response_message = "Successfully removed event by _id";
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


const update_event = async (req, res) => {

    console.log('in update event');

    let status = 200;
      let response_message = "";
      let success = false;
      try {
          let user = await get_user(req.params.username);
          if (user !== null) { //If we were able to find a user
              const target_id = req.body._id;
                 //let result = await user_model.findOneAndDelete({"user.events_unresolved.id":target_id}).exec();
              
              let found = false;

              console.log(req.body)
              
              //Not super efficient, but starting from the user is probably more efficient
              //than mongo starting from the root of the collection
              //Linear search will be over at most 15 or so items since the list is activley maintained
              for (let i = 0; i<user.events_unresolved.length; i++){
                  let event = user.events_unresolved[i];

                  console.log("Current event id "+event._id+" target event id "+target_id);
                  if (event._id == target_id){
                        found = true;

                        user.events_unresolved[i] = req.body;
                        console.log(req.body.progress);
                        if (req.body.progress < 100){
                            //IF YOU'RE HAVING A BUG WHERE IT DOESN"T UPDATE THIS IS PROBABLY THE SOLUTION
                            // user.events_unresolved[i] = req.body;
                        }
                        else {
                            user.events_unresolved.splice(i,1);
                            user.archive_event(req.body); //So that the archive will get the most recently updated version
                        }
                   }
              }
  
              if (found) {
                  try {
                      await user.save();
                      status = 200; //idk man
                      success = true;
                      response_message = "Successfully updated event by _id";
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




const read_unresolved_events = async (req, res) => {

    const username = req.params.username;
    let success = false;

    function func (user) { //When defined out here, the function gets our req and res objects from this scope
        let status = 200;
        let response_message = "";
        let content = "";
        
        if (user !== null) { //If we were able to find a user

            status = 200;
            success = true;
            response_message = "Returning all unresolved events for this user";
            content = user.events_unresolved;
        
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


async function get_user (username) {
    let user = await user_model.findOne({"username": username}).exec();
    //Note: left part of json should be wrapped in quotes "" to distinguish it from the variable
    //Also, make sure to use .exec() to ACTUALLY EXECUTE THE FUCKING QUERY MORON

    if (user){
        return user;
    }
    else {
        return null;
    }
}



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


const controller_functions = {create_user, login_user, add_event, 
    delete_unresolved_event, update_event, read_unresolved_events, 
    add_course, read_courses, update_course, delete_course,
    read_userinfo, update_userinfo, delete_user, check_session, 
    logout_user, read_university_info, create_course_for_university, define_university,
    read_archived_events, restore_archived_event, create_user_controller};
export {controller_functions};


























































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