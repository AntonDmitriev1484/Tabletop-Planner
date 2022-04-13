
import mongoose from 'mongoose';
let m = mongoose.models;

import connect from '../../connect_mongo.js';
import {user_model} from '../model/user_model.js'

const mongo_cli = connect(); //Call connect to set up our connection to mongodb

//All of these functions need to be async since we're using .save() on mongoose objects to the database
const create_user = async (req,res) => {
    //Assuming that the body of the request will be formatted in the way we need it
    // {
    //     username: User,
    //     email: email@email.com,
    //     password: 12345 //Password DOES get set like this, even as a virtual field
    // }

    let user = new user_model(req.body);

    let status = 200;
    let response_message = "";

    try {
        await user.save();
        status = 200;
        response_message = "User has been successfully created"
    }
    catch (err){
        console.log(err);
        status = 400; //Figure out error codes later
        response_message = "Error Name: "+err.name+".\n Error Message: "+err.message;
    }

    //https://expressjs.com/en/4x/api.html#res.json
    res.status(status).json({ message: response_message});
    return res;
}

const login_user = async (req,res) => {
    
    let username = req.body.username;
    let pass_attempt = req.body.password;

    //Need to query mongodb by username

    let status = 200;
    let response_message = "";
    try {
        let user = await get_user(username);

        if (user !== null) { //If we were able to find a user

            if (user.check_pass(pass_attempt)){
                status = 200;
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

    res.status(status).json({message: response_message});

}

const add_events = async (req,res) => {

    let status = 200;
    let response_message = "";
    try {
        let user = await get_user(req.params.username);
        if (user !== null) { //If we were able to find a user
            let homework = m.homework_model(req.body);

            user.events_unresolved.push(homework);

            try {
                await user.save();
                status = 200;
                response_message = "Event added to planner successfully";
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
    res.status(status).json({message: response_message});
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


const controller_functions = {create_user, login_user, add_events};
export {controller_functions};






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