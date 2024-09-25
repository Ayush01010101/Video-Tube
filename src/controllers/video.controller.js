import { Video } from "../models/Video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Uploadfileoncloudinary } from "../fileupload/fileupload.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { Destroyfileoncloudinary } from "../fileupload/fileupload.js";
import mongoose, { isValidObjectId } from "mongoose";


//get all vidoes by query
//pending
const getAllVideos=AsyncHandler(async(req,res)=>{
   const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
   
   //todo's to get the video by prefrence
   //get all owners video 

  const videos=await Video.find(title=query)
})



//complete
const UploadVideo = AsyncHandler(async (req, res) => {
  //todos to upload video
  //ensure are fields are filled
  //get the path of the video store the file locally first
  //upload the local file on cloudinary
  //get the duaration of video using clodinary
  // create video document
  // send res... with status code 200 "Suceess!!"

  const { title, description, ispublic } = req.body;

  if ([title, description, ispublic].some((x) => x === "")) {
    throw new ApiError(400, "All Fields are Required");
  }

  //video and thumbnail path
  const videopath = req.files.videofile[0].path;
  const thumbnailpath = req.files.thumbnail[0].path;


  if (!videopath || !thumbnailpath) {
    throw new ApiError(400, "Video and Thumbnail is Required!!");
  }

  //upload the thumbnail on cloudinary
  
  //upload video on cloudinary
  const videoupload = await Uploadfileoncloudinary(videopath);
  if (!videoupload) {
       throw new ApiError(400, "Failed to Upload video  on Cloudinary ");
     }
     
     const thumbnailupload = await Uploadfileoncloudinary(thumbnailpath);
     
     if (!thumbnailupload) {
          throw new ApiError(400, "Failed to upload thumbnail on cloudinary ");
        }

  
  const video = await Video.create({
    videofile:{
      videofile:videoupload.url,
      public_id:videoupload.public_id
    },
    
    title,
    description,
    ispublic,
    
   
    duration:videoupload.duration,
    thumbnail: {
      thumbnail:thumbnailupload.url,
      public_id:thumbnailupload.public_id
    },
  });

  if (!video) {
    throw new ApiError(400, "Server side error While Creating Video Document");
  }
  res
    .status(200)
    .json(new ApiResponce(200, "Video Uploaded Sucessfullly!!", {video}));
});

const GetVideoById=AsyncHandler(async(req,res)=>{
  //todos to give the all  data of video
  //likes //views //like by 
  //get the video id from req.params
  //find in the mongodb using findby id

  const {videoid}=req.params

  const video=await Video.aggregate([
    {
      $match:{
        _id:new mongoose.Types.ObjectId(videoid)
      },
      $lookup:{
        from:"likes",
        localField:"_id",
        foreignField:"video",
        as:"likes"
      },

      $lookup:{
        from:"User",
        localField:"owner",
        foreignField:"_id",
        as:"owner",
        
      },
      

        $addFields:{
          likecount:{
          $size:"$likes"
        },
        owner:{
          $first:"$owner"
        },
        likeby:{
          $cond:{
            $if:{
              $in:[req.user._id,"$likes.likeby"]
            }
          }
        }
      },
      
        $project:{
          videofile:1,
          thumbnail:1,
          owner:1,
          title:1,
          description:1,
          duration:1,
          views:1,
          likecount:1,
          owner:1,
          likeby:1
        }
        
      
    }
  ])

  if(!video){
    throw new ApiError(500,"Server side error")
  }

  console.log(video)

  res.status(200)
  .json(
    {
      working:"Working"
    }
  )

})  



//complete
const VideoUpdate=AsyncHandler(async (req,res)=>{

  //todo to update vidoe details
  //title,description,thumbnail
  //we check the video id is correct or not 
  //get the document from mongodb 
  //check the owner of the video
  //get the thumbnail file from multer 
  //check its valid or not
  //upload thumbnail on cloudinary and delete the previous one 
  //save the changes in database
  //sent res... to user with status code 200 "Success!!"

  const Videoid=req.params.VideoId
  const {description,title}= req.body
  
  // console.log(title,description)
  //check the owner
  
  if(!isValidObjectId(Videoid)){
    new ApiError(400,"Videoid is not valid")
    
  }
  console.log(req.params)
  
  
  if(!Videoid){
    throw new ApiError(400,'video id required')
  }
  if(!(description && title)){
    throw new ApiError(400,'Description or title is required')
  }

  const video=await Video.findById(Videoid)
  // console.log(video)
  
  // if(req.user._id.toString()!== video.owner){
  //   throw new ApiError(400,"Only Owner Can Edit This")
  // }

  const thumbnailpath=req.file?.path
  console.log(thumbnailpath)

  const thumbnailupload=await Uploadfileoncloudinary(thumbnailpath)
  
  if(!thumbnailupload  &&   thumbnailpath!==undefined ){
    throw new ApiError(500,"Server Side Error while uploading thumbnail on cloudinary ")
  }
  if(thumbnailupload){
    //delete the previous one
    const deletethumbnail=await Destroyfileoncloudinary(video.thumbnail.public_id)
    if(!deletethumbnail){
      throw new ApiError(500,"Server side error while deleting thumbnail")
    }
  }
  console.log(thumbnailupload)

  const currentvideo=await Video.findByIdAndUpdate(Videoid,{
    thumbnail:{
      thumbnail:thumbnailupload==null?video.thumbnail.thumbnail:thumbnailupload.url,
      public_id:thumbnailupload==null?video.thumbnail.public_id:thumbnailupload.public_id

    },    
    title,
    description
  },{new:true})

  console.log(currentvideo)
  if(!currentvideo){
    throw new ApiError(500,"Server side error while set the doucment in mongodb")
  }

  res.status(200)
  .json(
    new ApiResponce(200,"Data Updated Suceesfully!!",currentvideo)
  )
})

//v del not working yet...
const DeleteVideo=AsyncHandler(async (req,res)=>{
  //delete the video from the cloudinar
  //delete the thumbnail from cloudinary 
  //delete the dataset object


  const {videoid}=req.params;

  if(!videoid){
    throw new ApiError(400,"video id required!!")
  }
  //get the info 
  const video=await Video.findById(videoid)

  if(!video){
    throw new ApiError(400,"Video Id Must Be Valid!!")
  }

  const videodelete=await Video.deleteOne({_id:videoid})


  if(!videodelete){
    throw new ApiError(400,"Video Not Found!!")
  }

  //delete video from cloudinary
  const deletethumbnail=await Destroyfileoncloudinary(video.thumbnail.public_id);

  if(!deletethumbnail){
    throw new ApiError(504,"Server side error while deleting thumbnail ")
  }

  console.log(video.videofile.public_id)
  
  const deletevideo=await Destroyfileoncloudinary("vfjcznnvaahqe8dktnud")
  if(!deletevideo){
    throw new ApiError(504,"Server side error while deleting video")
  }
  

  res.status(200)
  .json(
    new ApiResponce(200,"Video Sucessfully Deleted!!",videodelete)
  )
})



//complete
const TooglePublish=AsyncHandler(async (req,res)=>{
  //todo's for toogle publish
  //find the video by using id 
  //reverse it by using ! 
  //send the responce with status code 200 "Sucess!!"

  const {videoid}= req.params

  if(!videoid){
    throw new ApiError(400,"Video id is Required!!")
  }
  //find the video in mongdb
  const video=await Video.findById(videoid)
  
  if(!video){
    throw new ApiError(400,"Data not found!!")
  }

  const changestatus=video.ispublic=!video.ispublic;

  

  const save= await video.save();
  
  if(!save){
    throw new ApiError(500,"Server side error while updating the state")
  }
  res .status(200)
  .json(
    new ApiResponce(200,"Sucesfully Change Video Status!!",video)
  )

})  

export { UploadVideo,VideoUpdate,GetVideoById,DeleteVideo,TooglePublish}
