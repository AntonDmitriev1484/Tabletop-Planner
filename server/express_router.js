import express from 'express'
import {controller as controller_functions} from './controller/user_controller.js'
import {check_session, load_user_by_username} from './controller/middleware/user_middleware.js'

const router = express.Router();

router.route('/register')
    .post(
        controller_functions.create_user.run
    )

router.route('/auth') //Handles login/logout/cookies requests
    .post( //Post is best for login as it is most secure
        load_user_by_username,
        controller_functions.login_user.run
    )
        
router.route('/user/:username/logout')
    .get(
        controller_functions.logout_user
    )

//Here :username is a route parameter

router.use('/user/:username/events', check_session, load_user_by_username); //Sets up middleware
router.route('/user/:username/events') //Adds specific route handlers
        .post( controller_functions.add_event.run)
        .delete( controller_functions.delete_unresolved_event.run)
        .put( controller_functions.update_event.run)
        .get( controller_functions.read_unresolved_events.run)



router.route('/user/:username/archive')
        .get(controller_functions.check_session, controller_functions.read_archived_events)
        .post(controller_functions.check_session, controller_functions.restore_archived_event)


router.use('/user/:username/courses', check_session, load_user_by_username); //Sets up middleware
router.route('/user/:username/courses') //'course' used here, will be dealing with pcourse objects in mongodb
        .post(controller_functions.add_course.run)
        .get(controller_functions.read_courses.run)
        .put(controller_functions.update_course.run)
        .delete(controller_functions.delete_course.run);
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