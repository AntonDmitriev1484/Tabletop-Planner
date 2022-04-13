import {user_model} from '../model/user_model.js'


//All of these functions need to be async since we're using .save() on mongoose objects to the database
const create_user = async (req,res) => {
    //Assuming that the body of the request will be formatted in the way we need it
    user = new user_model(req.body);

    try {
        await user.save();
    }
    catch (err){
        console.log(err);
    }
}

const login_user = (req,res) => {
    
}


export {create_user, login_user};