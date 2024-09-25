import { Tweets } from "../models/Tweets.models.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

//complete
const createtweet=AsyncHandler((req,res)=>{
    const {content}=req.body

    if(!content){
        throw new ApiError(400,"Content is Missing!!")
    }

    const tweet=Tweets.create({
        content
    })

    if(!tweet){
        throw new ApiError(500,"Server side error while creating tweet")
    }

    res.status(200)
    .json(
        new ApiResponce(200,"Successfully!! Created Tweet",tweet)
    )
})

//complete
//test is pending
const Getusertweet=AsyncHandler(async (req,res)=>{
    const {userid}=req.params

    if(!userid){
        throw new ApiError(400,"User Id required!!")
    }

    const tweet=await Tweets.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(userid)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"ownerdetails",
                pipeline:[
                    {
                        $project:{
                            avatar:1,
                            username:1,

                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"tweet",
                as:"likedetails",
                pipeline:[
                    {
                        $project:{
                            likeby:1,
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                likecount:{
                    $size:"$likedetalis"
                },
                owner:{
                    $first:"$ownerdetails"
                },
                isliked:{
                    $cond:{
                        if:{$in:[req.user._id,"$likedetails.likeby"]},
                        then:true,
                        else:false
                        
                    }
                }
                
            }
        },


        {
            $project:{
                likecount:1,
                owner:1,
                isliked:1,
                content:1,
            }
        }
       

    ])

    if(!tweet){
        throw new ApiError(404,"User is not found ")
    }

    console.log(tweet)

    res.status(200)
    .json(
        new ApiResponce(200,"Done!!",tweet)
    )
})

const Updatetweet=AsyncHandler(async(req,res)=>{
    const {tweetid}= req.params
    const {content}=req.body

    if(!content || !content){
        throw new ApiError(400,"tweetid and content is required!!")
    }

    const tweet=await Tweets.findByIdAndUpdate(
        new mongoose.Types.ObjectId(tweetid),
        {
            $set:{
                content
            }
        },
        {
            new:true
        }


    )

    if(!tweet){
        throw new ApiError(400,"Tweet Not found ")
    }

    res.status(200)
    .json(
        new ApiResponce(200,"Sucessfully Updated!!",tweet)
    )

})

const Deletetweet=AsyncHandler(async(req,res)=>{
    const {tweetid}=req.params

    if(!tweetid){
        throw new ApiError(400,"twetter id is required!")
    }

    console.log(mongoose.isValidObjectId(tweetid))

    const tweet=await Tweets.findByIdAndDelete(tweetid)

    if(!tweet){
        throw new ApiError(500,"Server side error while deleting the tweet")
    }

    res.status(200)
    .json(
        new ApiResponce(200,"Tweet Succesfully Deleted!!")
    )
})

export {
    createtweet,
    Getusertweet,
    Updatetweet,
    Deletetweet
}