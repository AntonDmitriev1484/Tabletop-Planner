import express from 'express'
import {controller_functions} from './controller/user_controller.js'

const router = express.Router();

//Similar syntax to saying
// router.get('/', (req, res) => {
//     res.send('Birds home page')
//   })

router.route('/test')
    .get(
        (req, res, next) => {
           console.log("hello world express");
        
           
           return res.status(200).json({
               message: "Hello world express from the ec2"
           })
        }
    )
    .post(
        (req, res, next) => {
            console.log("hello world express");
            console.log(req);
            
            return res.status(200).json({
                message: "Hello world express from the ec2"
            })
         }
    )

router.route('/register')
    .post(
        //Using post to create a new resource
        controller_functions.create_user
    )

router.route('/auth') //Handles login/logout/cookies requests
    .post( //Post is best for login as it is most secure
        controller_functions.login_user
    )
    // .get(
    //     controller_functions.logout_user
    // )


//Here :username is a route parameter
//We will use the unique username passed in the url, to retreive the proper
//user model from our mongodb user collection
//https://expressjs.com/en/guide/routing.html helps a lot

//https://www.geeksforgeeks.org/express-js-router-param-function/
//We can set up a callback function for each time a specific parameter like :username
//appears in the url
// router.param('username', 
// controller_functions.user_parameter_callback
// )


router.route('/user/:username/events')
        .post(controller_functions.add_event)
        .delete(controller_functions.delete_unresolved_event);

        
router.route('/user/:username')



export {router}