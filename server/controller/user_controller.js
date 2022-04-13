
import mongoose from 'mongoose';
let m = mongoose.models;
import {user_model} from '../model/user_model.js'

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

const login_user = (req,res) => {
    
}

const controller_functions = {create_user, login_user};
export {controller_functions};