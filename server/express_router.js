import express from 'express'
import {controller_functions} from './controller/user_controller.js'

const router = express.Router();

//Similar syntax to saying
// router.get('/', (req, res) => {
//     res.send('Birds home page')
//   })

// router.route('/test')
//     .get(
//         (req, res, next) => {
//            console.log("hello world express");
        
           
//            return res.status(200).json({
//                message: "Hello world express from the ec2"
//            })
//         }
//     )
//     .post(
//         (req, res, next) => {
//             console.log("hello world express");
//             console.log(req);
            
//             return res.status(200).json({
//                 message: "Hello world express from the ec2"
//             })
//          }
//     )

router.route('/register')
    .post(
        //Using post to create a new resource
        //controller_functions.create_user.bind(controller_functions.test_obj)
        
        //Works
        //controller_functions.create_user

        //controller_functions.create_user_controller.controller_function

        controller_functions.create_user.bind(controller_functions.create_user_controller)
    )

router.route('/auth') //Handles login/logout/cookies requests
    .post( //Post is best for login as it is most secure
        controller_functions.login_user
    )
        
router.route('/user/:username/logout')
    .get(
        controller_functions.logout_user
    )


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
        .post(controller_functions.check_session, controller_functions.add_event)
        .delete(controller_functions.check_session, controller_functions.delete_unresolved_event)
        .put(controller_functions.check_session, controller_functions.update_event)
        .get(controller_functions.check_session, controller_functions.read_unresolved_events)

router.route('/user/:username/archive')
        .get(controller_functions.check_session, controller_functions.read_archived_events)
        .post(controller_functions.check_session, controller_functions.restore_archived_event)


router.route('/user/:username/courses') //'course' used here, will be dealing with pcourse objects in mongodb
        .post(controller_functions.check_session, controller_functions.add_course)
        .get(controller_functions.check_session, controller_functions.read_courses)
        .put(controller_functions.check_session, controller_functions.update_course)
        .delete(controller_functions.check_session, controller_functions.delete_course);
        //should also feature a request / some way to archive a course


router.route('/user/:username')
        .get(controller_functions.read_userinfo) //Get user doesnt really need authentification since it provides so little information
        .put(controller_functions.check_session, controller_functions.update_userinfo)
        .delete(controller_functions.check_session, controller_functions.delete_user);



//To add a new university to the database
router.route('/university')
        .post(controller_functions.define_university)
        // .get(controller_functions.get_universities);

//Users will input their university name to see what courses they have available to them
router.route('/university/:universityname/courselist')
        .get(controller_functions.read_university_info)
        .post(controller_functions.create_course_for_university)
        .delete()

export {router}