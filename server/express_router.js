import express from 'express'

import {check_session, load_user_by_username, create_event_archive,
    find_unresolved_event, find_current_course, load_event_archive} from './controller/middleware/user_middleware.js'
import {controllers as user_controller} from './controller/user_controller.js'

import {define_university, read_university_info, create_course_for_university} from './controller/uni_controller.js'


const router = express.Router();

router.route('/register')
    .post(create_event_archive, user_controller.create_user.run)

router.route('/auth') //Handles login/logout/cookies requests
    .post( //Post is best for login as it is most secure
        load_user_by_username,
        user_controller.login_user.run
    )
        
router.route('/user/:username/logout')
    .get(user_controller.logout_user)

//Here :username is a route parameter

router.use('/user/:username/events', check_session, load_user_by_username); //Sets up middleware
router.route('/user/:username/events') //Adds specific route handlers
        .post( user_controller.add_event.run)
        .delete( find_unresolved_event, user_controller.delete_unresolved_event.run)
        .put( find_unresolved_event, user_controller.update_event.run)
        .get( user_controller.read_unresolved_events.run)




//For testing shifting dates up appropriatley
router.use('/user/:username/events/shift', check_session, load_user_by_username, load_event_archive);
router.route('/user/:username/events/shift')
        .get( user_controller.shift_incomplete_events.run);


        
router.use('/user/:username/archive', check_session, load_user_by_username, load_event_archive); //Sets up middleware
router.route('/user/:username/archive')
        .get( user_controller.read_archived_events.run)
        .post( user_controller.restore_archived_event.run)


router.use('/user/:username/courses', check_session, load_user_by_username); //Sets up middleware
router.route('/user/:username/courses') //'course' used here, will be dealing with pcourse objects in mongodb
        .post(user_controller.add_course.run)
        .get(user_controller.read_courses.run)
        .put( find_current_course, user_controller.update_course.run)
        .delete( find_current_course, user_controller.delete_course.run);
        //should also feature a request / some way to archive a course


router.use('/user/:username', check_session, load_user_by_username); //Sets up middleware       
router.route('/user/:username')
        .get(user_controller.read_userinfo.run) //Get user doesnt really need authentification since it provides so little information
        .put(user_controller.update_userinfo.run)
        .delete(user_controller.delete_user.run);






        

//To add a new university to the database
router.route('/university')
        .post(define_university)
        // .get(controller_functions.get_universities);

//Users will input their university name to see what courses they have available to them
router.route('/university/:universityname/courselist')
        .get(read_university_info)
        .post(create_course_for_university)
        .delete()



export {router}