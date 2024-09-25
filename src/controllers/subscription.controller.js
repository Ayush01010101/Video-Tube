import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import mongoose, { isValidObjectId, mongo } from "mongoose";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { Subscription } from "../models/Subscription.model.js";
const tooglesubscription = AsyncHandler(async (req, res) => {
    //todo's to toogle subscription
    //get the channel id from req.params
    //get the current user from jwt middleware
    //check the user already subscribed or not
    //toggle the status 

    const { channelid } = req.params

    if (!channelid) {
        throw new ApiError(400, "Channel Id Is Required!!")
    }

    const query = await Subscription.findOne(
        {
            subscribe: req.user?._id,
            channel: channelid
        }

    )
    console.log(query)
    if (query) {
        const operation = await Subscription.findByIdAndDelete(query._id)
        if (!operation) {
            throw new ApiError(500, "Server side error")

        }

        res.status(200)
            .json(
                new ApiResponce(200, "Sucesfully Unsubscirbed")
            )
    }

    const create = await Subscription.create(
        {
            subscribe: req.user?.id,
            channel: channelid

        }
    )
    if (!create) {
        throw new ApiError(500, "Server side error while creating a object")
    }

    res.status(200)
        .json(
            new ApiResponce(200, "Sucesfully Subscribed!!", create)
        )

})

const Getuserchannelsubscriber = AsyncHandler(async (req, res) => {
    //todos for user channel subscriber
    //get the user id from req.params
    //check it's valid or not
    //aggergation pipeline starts 
    //match the user id  to channeel id 
    //give the size of docs
    //add fields

    const { userid } = req.params

    if (!mongoose.isValidObjectId(userid)) {
        throw new ApiError(404, "User Id Must Be Valid!!")
    }


    const count=await Subscription.aggregate([
        {
            $match: { channel: new mongoose.Types.ObjectId(userid) }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscribe",
                foreignField: "_id",
                as: "subscribers",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            _id: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                subscribercount: {
                    $size: "$subscribers"
                }
            }
        },
        {
            $project: {
                subscribe: 1,
                channel: 1,
                subscribercount: 1
            }
        }

    ])
    console.log(count)

    if (!count) {
        throw new ApiError(500, "Server side error while counting  subscriber")
    }

    res.status(200)
        .json(
            new ApiResponce(200, "Sucesfully fetched subscriber!!", count)
        )


})


const Getsubscribedchannel=AsyncHandler(async(req,res)=>{
    const {userid}=req.params

    if(!isValidObjectId(userid)){
        throw new ApiError(400,"User Id Must Be valid!!")
    }

    const user=await Subscription.aggregate(
        [
            {
                $match:{
                    subscribe:new mongoose.Types.ObjectId(userid)
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"channel",
                    foreignField:"_id",
                    as:"subscribeto",
                    pipeline:[
                        {
                            $project:{
                                username:1,
                                avatar:1,
                                _id:1,
                            }
                        }
                    ]
                }
            },
            {
                $addFields:{
                    Subscribecount:{
                        $size:"$subscribedto"
                    },
                    channelnames:{
                        $map:{
                            input:"$subscribedto",
                            as:"channelnames",
                            in:"$$channelnames.username"
                        }
                    }
                }
            },
            {
                $project:{
                    subscribe:1,
                    channel:1,
                    Subscribercount:1,
                    channelnames:1
                }
            }
        ]
    )
    
    console.log(Getsubscribedchannel)

    res.status(200)
    .json(
        new ApiResponce(200,"Sucessfully Get Subscribeto",Getsubscribedchannel)
    )

})

export { tooglesubscription, Getuserchannelsubscriber }