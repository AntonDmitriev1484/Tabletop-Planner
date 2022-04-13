
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
        let user = await user_model.findOne({"username": username}).exec();
        //Note: left part of json should be wrapped in quotes "" to distinguish it from the variable
        //Also, make sure to use .exec() to ACTUALLY EXECUTE THE FUCKING QUERY MORON


        if (user) { //If we were able to find a user

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
    // let user = mongo_cli.user.find({username: username});

}



const controller_functions = {create_user, login_user};
export {controller_functions};