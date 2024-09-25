import mongoose from "mongoose";
import { Schema } from "mongoose";

const CommentsSchema=new Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    content:{
        type:String,
        required:true,
        
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }

},{timestamps:true})


export const Comments=mongoose.model("Comments",CommentsSchema)