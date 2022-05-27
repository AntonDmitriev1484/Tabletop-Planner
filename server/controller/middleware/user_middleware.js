import {user_model} from '../../model/user_model.js'


//Session authentication
const check_session = (req, res, next) => {
    console.log('checking session');
    if (global.session.username === req.params.username){
        next()
    }
    else {
        return res.status(400).json({message:"You are not authorized to manipulate this user's information"});
    }
}



async function load_user_by_username (req, res, next) {
    console.log('loading user');

    let username = req.body.username; //When we login username is in the body of the request

    if (req.body.username === undefined) {
        username = req.params.username; //Otherwise, its a route parameter
    }


    let user = await user_model.findOne({"username": username}).exec();

    if (user !== null) {
        req.user = user;
        next();
    }
    else {
        return res.status(202).json({status:202, message:"User with this username doesn't exist."});
    }
}

export {check_session, load_user_by_username}