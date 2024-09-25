
//PENDING

import mongoose , { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { Likes } from "../models/Likes.model.js";
import { Subscription } from "../models/Subscription.model.js";
import { User } from "../models/User.model.js";
const Getchannelstats = AsyncHandler(async (req,res)=>{
    //todos::- 
    //totoal video views 
    //total subscriber
    //total videos 
    // total likes

    const userid=req.user._id;
    if(!isValidObjectId(userid)){
        throw new ApiError(400,"User is not logged in  ")
    }
    
    //total subscriber
    const totalsub=await User.aggregate(
        [   
            {
                $match:{
                    _id:new mongoose.Types.ObjectId(userid)
                }
            },
            {
                $lookup:{
                    from:"subscriptions",
                    localField:'_id',
                    foreignField:"channel",
                    as:"subscribers"
                }

            },
            
            {
                $addFields:{
                subscribercount:{
                    $size:"$subscribers"
                },
               
               
            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                subscribercount:1,
                avatar:1,
                createdAt:1



            }   
        }
        ]
    )


    if(!totalsub){
        throw new ApiError(400,"Can't get Subscribers")
    }


    
    
})  