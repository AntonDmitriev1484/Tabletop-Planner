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

router.route('/login')
    // .post(
    //     controller_functions.login_user
    // )
    .post(
        //Using post to create a new resource
        controller_functions.create_user
    )

export {router}