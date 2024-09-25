import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import mongoose, {isValidObjectId} from "mongoose";
import { Playlist } from "../models/Playlist.model.js";
import { AsyncHandler } from "../utils/AsyncHandler";


const createplaylist=AsyncHandler(async(req,res)=>{
    const {name,description}=req.body

    if(!name || !description){
        throw  new ApiError(400,"name and description is required!!")
    }

   const create= await Playlist.create({
        name,
        description,
        owner:req.user?._id
    })

   if(!create){
    throw new ApiError(501,"Server Side error while  creating a document")
   }

   res.status(200)
   .json(
    new ApiResponce(200,"Playlist Created Sucessfully!!")
   )    
})

const getuserplaylists=AsyncHandler(async(req,res)=>{
    const {userid}=req.params

    const playlist=await Playlist.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userid)
            },
           

           
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videodetails",
             
            }
        },
        {
            $addFields:{
                totalvideos:{
                    $size:"$videodetails"
                },


            }
        }
    ])

    if(!playlist){
        throw new ApiError(500,"Server side Error while getting playlists")
    }

    res.status(200)
    .json(
        new ApiResponce(200,"Sucessfully Fetch Playlists!!",playlist)
    )
})

const getplaylistbyid=AsyncHandler(async(req,res)=>{        
    const {playlistid}=req.params
    
    if(!isValidObjectId(playlistid)){
        throw new ApiError(400,"Playlist is not valid")
    }

    const playlist=await Playlist.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(playlistid)
            },
            
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videodetails"
            },
            
        },
        {
            $addFields:{

                totalvideos:{
                    $size:"$videodetails"
                },
                totalviews:{
                    $sum:"$videodetails.views"
                }

            }
        },
        {
            $project:{
                totalvideos:1,
                totalviews:1,
                name:1,
                description:1,
                videodetails:1,
            }
        }
    ])

    if(!playlist){
        throw new ApiError(500,"Server side error while fetching playlist by id ")
    }

    res.status(200).
    json(
        new ApiResponce(200,"Succesfully Fetched Playlist by id ") )   

})


const Deleteplaylist=AsyncHandler(async(req,res)=>{
    const {playlistid}=req.params

    const check=await Playlist.findById(playlistid)

    if(!check){
        throw new ApiError(400,"Something went Wrong !!")
    }

    if(check.owner !== req?.user._id){
        console.log("Only Owner Can Edit !!")
    }

    //check the owner of playlist 

    if(!isValidObjectId(playlistid)){
        throw new ApiError(404,"Playlist Id Not Valid ")
    }

    const playlist=await Playlist.findByIdAndDelete(playlistid)

    if(!playlist){
        throw new ApiError(500,"Failed While Deleting Playlist!!")
    }


    res.status(200)
    .json(
        new ApiResponce(200,"Sucesfully Deleted The Playlist")
    )
})

const Updateplaylist=AsyncHandler(async(req,res)=>{
    const {playlistid}=req.params
    const {name,description}= req.body

    if(!isValidObjectId(playlistid)){
        throw new ApiError(401,"Playlist id must be valid")
    }

    if(!name || !description){
        throw new ApiError(400,"name and description required!!")
    }

    //find by id
    const playlist=await Playlist.findByIdAndUpdate(playlistid,
        {
            $set:{
                name,
                description,
                
            }
        },
        {
            new:true
        }
    )

    if(!playlist){
        throw new ApiError(401,"Playlist Not Found")
    }
    res.status(200)
    .json(
        new ApiResponce(200,"Playlist Updated Sucessfully!")
    )
})

const Addvideotoplaylist=AsyncHandler(async(req,res)=>{
    const {playlistid,videoid}=req.params
    
    if(!isValidObjectId(playlistid) || !isValidObjectId(videoid)){
        throw new ApiError(400,"playlist and videoid must be valid")
    }

    //find playlist by id 
    const playlist=await Playlist.findById(playlistid)

    if(playlist.videos.include(videoid)){
        throw new ApiError(404,"Client Side Error (Video already exists in playlist)")
    }
    const push=playlist.videos.push(videoid)

    if(!push){
        throw new ApiError(502,"Server side error failed to push a video")
    }

    res.status(200).
    json(
        new ApiResponce(200,"Sucesfully Added Video to playlist")
    )
})

const Removevideofromplaylist=AsyncHandler(async(req,res)=>{
    const {playlistid,videoid}=req.params

    if(!isValidObjectId(playlistid) || !isValidObjectId(videoid)){
        throw new ApiError(400,"Playlist and videoid is required!!")
    }

    //find by id 
    const playlist=await Playlist.findById(playlistid)

    if(!playlist.vidoes.include(videoid)){
        throw new ApiError(400,"Video not exist in playlist")
    }
    
    //remove video oper...
    const del=await Playlist.findByIdAndUpdate(videoid,
        {
            $pull:{
                videos:{videoid}
            }
        },
        {
            new:true
        }
    )

    if(!del){
        throw new ApiError(500,"Server side error")
        
    }

    res.status(200)
    .json(
        new ApiResponce(200,"Sucesfully removed video from playlist!!")
    )
})

export{
    createplaylist,
    getuserplaylists,
    Deleteplaylist,
    Addvideotoplaylist,
    getplaylistbyid,
    Removevideofromplaylist
}