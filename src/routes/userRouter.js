import { Router } from "express";
import { Usercontroller } from "../controllers/user.controller.js";
const router=Router()

router.use("/register",Usercontroller)

export {router} 