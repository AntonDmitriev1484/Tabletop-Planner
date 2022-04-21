
import res from 'express/lib/response.js';
import mongoose from 'mongoose';
let m = mongoose.models;

import connect from '../../connect_mongo.js';
import {user_model} from '../model/user_model.js'
import {event_archive_model, event_archive_schema} from "../model/event_archive_model.js"
import {university_model, university_schema} from "../model/university_model.js"


const mongo_cli = connect(); //Call connect to set up our connection to mongodb


let session = "";


//All of these functions need to be async since we're using .save() on mongoose objects to the database
const create_user = async (req,res) => {
    //Assuming that the body of the request will be formatted in the way we need it
    // {
    //     username: User,
    //     email: email@email.com,
    //     password: 12345 //Password DOES get set like this, even as a virtual field
    // }

    let status = 200;
    let response_message = "";
    let success = false;
    
    let event_archive = new event_archive_model();

    try {
        await event_archive.save();
        let user = new user_model(req.body);
        //Gives each new user a ref to their event_archive
        user.event_archive = event_archive.id;
    
    
        try {
            await user.save();
            status = 200;
            success = true;
            response_message = "User has been successfully created"
        }
        catch (err){
            console.log(err);
            status = 400; //Figure out error codes later
            response_message = "Error Name: "+err.name+".\n Error Message: "+err.message;
        }
    }
    catch (err){
        console.log(err);
        status = 400; //Figure out error codes later
        response_message = "Error Name: "+err.name+".\n Error Message: "+err.message;
    }

    //https://expressjs.com/en/4x/api.html#res.json
    if (status === 200){ //TEMPORARY FIX TO BAD ERROR CODES
        res.status(status).json({message: response_message,  success: true});
    }
    else {
        res.status(status).json({message: response_message,  success: false});
    }
    return res;
}

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

    let status = 200;
    let response_message = "";
    let success = false;

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

    let status = 200;
      let response_message = "";
      let success = false;
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
                        if (req.body.progress < 100){
                            event = req.body;
                        }
                        else {
                            user.events_unresolved.splice(i,1);
                            user.archive_event(event);
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
    let university_name = req.params.universityname;
    let status = 200;
    let body = {message:"", content:""};


    let model = university_model;

    query = {"university_name":university_name};


    const found = (university) => {
        body.content = university;
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
    let university_name = req.params.universityname;
    let status = 200;
    let body = {message:""};


    let model = university_model;

    console.log(university_name);
    const query = {"name":university_name};


    const found = async (university) => {

        let course = m.course_model(req.body);
        university.courses.push(course);

        status = 200; //idk man
        body.message = "Course has successfully been added to this university";
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






const fetch_from_db = async (model, query, found, not_found) => {
    try {
         let data = await model.findOne(query);
         found(data);
         try {
            await data.save();
         }
         catch (err) {
             console.log(err);
         }
    }
    catch (err) {
        not_found(err);
    }
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
    logout_user, read_university_info, create_course_for_university, define_university};
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