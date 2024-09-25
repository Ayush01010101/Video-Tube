import { GetVideoById, UploadVideo ,VideoUpdate,DeleteVideo,TooglePublish} from "../controllers/video.controller.js";
import { jwtverify } from "../middlewares/jwtverify.middleware.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";

const router=Router()

//all is secure endpoints

router.route("/upload-video").post(upload.fields(
[
    {
        name:"videofile",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    },
]
),UploadVideo)

router.route("/update-video/:VideoId").patch(upload.single("thumbnail"),jwtverify,VideoUpdate)

//for get the video info
router.route("/getvideo/:videoid").get(jwtverify,GetVideoById)


//for delete 
router.route("/delete-video/:videoid").post(DeleteVideo)


//toogle publish status

router.route("/toogle-publish/:videoid").patch(TooglePublish)

export {router}