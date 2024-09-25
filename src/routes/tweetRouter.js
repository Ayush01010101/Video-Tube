import express from 'express'
import { createtweet,Getusertweet } from '../controllers/tweet.controller.js'
import { jwtverify } from '../middlewares/jwtverify.middleware.js'
const router=express.Router()

router.route("/create-tweet").post(createtweet)

router.route("/get-tweets/:userid").get(jwtverify,Getusertweet)

export {router}