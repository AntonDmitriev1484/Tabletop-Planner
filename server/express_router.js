import express from 'express'
import {user_controller} from './server/controller/user_controller.js'

const router = express.Router();


router.route('/login')
    .post(
        user_controller.login_user
    )
    .put(
        user_controller.create_user
    )