import { Router } from "express";
import { Getuserchannelsubscriber } from "../controllers/subscription.controller.js";
const router=Router()

router.route('/get-subscriber/:userid').get(Getuserchannelsubscriber)

export{router}