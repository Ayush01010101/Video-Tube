import { ApiResponce } from "../utils/ApiResponce.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Likes } from "../models/Likes.model.js";

const Tooglevideolike = AsyncHandler(async (req, res) => {

    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "Video id is required!!")
    }

    const like = await Likes.findOne(
        {
            video: videoId,
            likeby: req.user?._id
        }
    )

    if (like) {
        //unsubscribe
        const like = await Likes.findOneAndDelete({
            video: videoId,
            likeby: req.user?._id
        })

        if (!like) {
            throw new ApiError(500, "Failed to unsubscribe")
        }
        res.status(200)
            .json(
                new ApiResponce(200, "Unsubscribed Successfully!!")
            )
    }

    const newlike = await Likes.create(
        {
            video: videoId,
            likeby: req.user?._id
        }
    )



    if (!newlike) {
        throw new ApiError(500, "Unliked to Subscribe")
    }
    res.status(200)
        .json(
            new ApiResponce(200, "Liked Successfully!!", newlike

            )
        )
})


const Tooglecommentlike = AsyncHandler(async (req, res) => {
    const { commentid } = req.params

    const commentdelete = await Likes.findOneAndDelete({
        comment: commentid,
        likeby: req.user?._id
    })

    if (commentdelete) {
        return res.status(200)
            .json(
                new ApiResponce(200, "Sucesfully Unliked", commentdelete)
            )
    }
    const createcomment = await Likes.create({
        comment: commentid,
        likeby: req.user?._id
    })

    return res.status(200)
        .json(
            new ApiResponce(200, "Sucesfully Liked", createcomment)
        )
})


const Toogletweetlike = AsyncHandler(async (req, res) => {
    const { tweetid } = req.params

    const likedel = await Likes.findOneAndDelete({
        tweeet: tweetid,
        likeby: req.user?._id
    })

    if (likedel) {
        return res.status(200)
            .json(
                new ApiResponce(200, "Unlike Sucessfully!1")

            )
    }

    const createlike = await Likes.create(
        {
            tweet: tweetid,
            likeby: req.user?._id
        }
    )

    return res.status(200)
        .json(
            new ApiResponce(200, "Sucessfully Unliked!!", createlike)
        )

})

const Getvideoliked = AsyncHandler(async (req, res) => {
    await Likes.aggregate(
        [
            {
                $match: {
                    likeby: new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $lookup: {
                    from: "vidoes",
                    localField: "video",
                    foreignField: "_id",
                    as: "videodetails",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "ownerdetails"
                            },

                        },
                        {
                            $project: {
                                username: 1,
                                avatar: 1,

                            }
                        }
                    ]
                },



            },
            {
                $addFields: {
                    totallikedvideos: {
                        $size: "$videodetails"
                    },

                }

            },

            {

                $project:{
                    videodetails:1,
                    ownerdetails:1,
                    totallikedvideos:1,
                    owner:1,
                    title:1,
                    description:1,
                    views:1,
                    thumbnail:1,
                    ispublic:1,

                }

            }
            ,


        ]
    )
})
export {
    Tooglevideolike,
    Tooglecommentlike,
    Toogletweetlike,
    Getvideoliked
}