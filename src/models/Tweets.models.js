import mongoose from "mongoose";

const TweetSchema=new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    content:{
        type:String,
        required:true,

    },



},{timestamps:true})

export const Tweets=mongoose.model("Tweets",TweetSchema)