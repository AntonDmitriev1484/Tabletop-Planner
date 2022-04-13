import express from 'express'
import {controller_functions} from './controller/user_controller.js'

const router = express.Router();

//Similar syntax to saying
// router.get('/', (req, res) => {
//     res.send('Birds home page')
//   })

router.route('/')
    .get(
        (req, res, next) => {
           console.log("hello world express");
           res.end;
        }
    )

router.route('/login')
    .post(
        controller_functions.login_user
    )
    .put(
        controller_functions.create_user
    )

export {router}