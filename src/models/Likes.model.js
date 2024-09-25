import mongoose ,{Schema} from "mongoose";

const LikesSchema=new Schema({
    comments:{
        type:Schema.Types.ObjectId,
        ref:"Comments"
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    likeby:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    tweet:{ 
        type:Schema.Types.ObjectId,
        ref:"Tweets"
    }


},{timestamps:true})


export const Likes=mongoose.model("Likes",LikesSchema)