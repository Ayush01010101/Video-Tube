import mongoose from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const VideoSchema=new mongoose.Schema({
    videofile:{
        type:Object,
        required:true
    },
    thumbnail:{
        type:Object,
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:Number,
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    ispublic:{
        
        type:Boolean,
        default:true
    }


},{timestamps:true})

VideoSchema.plugin(mongooseAggregatePaginate)
export const Video=mongoose.model("Video",VideoSchema)