import { Router } from "express";
import { Signupuser,Loginuser, LoggedoutUser, RefreshToken,ChangeCurrentPassword, GetCurrentUser,ChangeUsernameAndEmail, ChangeAvatar,Changecoverimage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { jwtverify } from "../middlewares/jwtverify.middleware.js";
const router=Router()

router.route("/register").post(
    upload.fields([{
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverimage",
        maxCount:1
    }]),
    Signupuser
)

//secure section 


//for login
router.route('/login').post(Loginuser)


//for logout current user
router.route("/logout").post(jwtverify,LoggedoutUser)


//for reset refresh token 
router.route("/refresh-token").post(RefreshToken)


//for Change-password
router.route("/change-password").post(ChangeCurrentPassword)


//get the current user data
router.route("/get-user").get(GetCurrentUser)


//for change username and email
router.route("/change-username-email").post(jwtverify,ChangeUsernameAndEmail)


//for change avatar ( profile picture)
router.route("/change-avatar").post(upload.single("avatar"),jwtverify,ChangeAvatar)


//for change coverimage (banner image)
router.route("/change-coverimage").post(upload.single("coverimage"),jwtverify,Changecoverimage)


export {router} 