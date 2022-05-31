import {user_model} from '../../model/user_model.js'

const saveUser = (req, res, user, info) => { //Assuming that this is the last thing we call in most of our controllers

    user.save().then( () => {
        info.message += "User has been successfully saved. "

        res.status(info.status)
        res.json(info);

        info.reset();
    })
    .catch((err) => {
        console.log(err);

        info.status = 400;
        info.message += "User save failed. ";
        
        res.status(info.status)
        res.json(info);

        info.reset();
    })
}

const saveArchive = (req, res, archive, info) => { //Assuming that this is the last thing we call in most of our controllers

    archive.save().then( () => {
        info.message += "Archive has been successfully saved. "

        res.status(info.status)
        res.json(info);

        info.reset();
    })
    .catch((err) => {
        console.log(err);

        info.status = 403; //idk something different from user save
        info.message += "Archive save failed. ";
        
        res.status(info.status)
        res.json(info);

        info.reset();
    })
}


// async function get_user (req, res, username, info) {

//     let user = await user_model.findOne({"username": username}).exec();
//     //Note: left part of json should be wrapped in quotes "" to distinguish it from the variable
//     //Also, make sure to use .exec() to ACTUALLY EXECUTE THE FUCKING QUERY MORON

//     // if (user){
//     //     return user;
//     // }
//     // else {
//     //     return null;
//     // }

//     return user;
// }

function run_on_unresolved_event(req, res, user, found) {

    const target_id = req.body._id;
    
    let found_event = false;

    //Not super efficient, but starting from the user is probably more efficient
    //than mongo starting from the root of the collection
    //Linear search will be over at most 15 or so items since the list is activley maintained
    for (let i = 0; i<user.events_unresolved.length; i++){
        let event = user.events_unresolved[i];
        if (event._id == target_id){
            found(i);
            found_event = true;
        }
    }

    if (!found_event) {
        this.info.status = 203; //idk man
        this.info.message = "Couldn't find event with this _id";

        this.res.status(this.info.status);
        this.res.json(this.info);
    }

}


export {saveUser, run_on_unresolved_event, saveArchive}
