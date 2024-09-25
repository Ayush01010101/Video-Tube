import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import { Uploadfileoncloudinary } from "../fileupload/fileupload.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Destroyfileoncloudinary } from "../fileupload/fileupload.js";
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";


const Signupuser=AsyncHandler(async (req,res)=>{
    //todo ::-
    //check the validation of user
    //check user is already login or not( account already exists?)
    // check the avatar and cover image is uploaded on cloundinary?
    // create a object and store in the mongodb 
    //remove password and refresh token from responce
    // check user creatation
    // return if( usercreatetion )== apireson.... ::: apierror


    const {username,email,fullname,password}= req.body
    

    if([username,email,fullname,password].some((field)=>field==="")){
        throw new ApiError(400,"All Fields Are Required")
    }

    const existeduser= await User.findOne({
        $or:[{username}, {email}]
    })
    
    if(existeduser){
        throw new ApiError(408,"User is Already Exists")
    }
    
    const avatarlocalpath=await req.files.avatar[0].path
    let coverimagelocalpath;
    
    if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length>0){
        coverimagelocalpath= await req.files.coverimage[0].path
    }
    
 
    if(!avatarlocalpath){
        throw new ApiError(403,"avatar image is required!!")
    }

        
    
    
    
    
    const avatar= await Uploadfileoncloudinary(avatarlocalpath)
    const coverimage=await Uploadfileoncloudinary(coverimagelocalpath)
    
    
    
    if(!avatar){
        throw new ApiError(500,"something went wrong in avatar upload")
    }
    
    
    const user= await User.create(
        {   
        username,
        email,
        fullname,
        avatar:avatar.url,
        coverimage:coverimage?coverimage.url : "" ,
        password:password
        

    }
)
const usercreatedornot=await User.findById(user._id).select("-password -refreshtoken")


if(!usercreatedornot){
     throw new ApiError(504,"user is failed to create , server side error")
}



res.status(200)
.cookie("avatarurl",avatar.public_id,{httpOnly:true,secure:true})
.cookie("coverimageurl",coverimage.public_id,{httpOnly:true,secure:true})
.json(
    new ApiResponce(200,"user created sucessfully",usercreatedornot)
)

})

const Loginuser= AsyncHandler(async (req,res)=>{
    //todo:- 
    //get the data from body
    //check all the fields are filled or not
    //check user existes in the database or not
    //call method to give the user accesss token
    // call method to give the user refresh token
    // if user existes sent res 
    // if user doesn't exist throw error 



    const {email,username,password}=req.body
   

    if(!(username || email)){
        throw new ApiError(405,"username or email is required")
    }   

    if(!password){
        throw new ApiError(405,"Password is required")
    }

    const  user =await User.findOne(
        {
            $or:[{username},{email}]
        }
    )


    if(!user){
        throw new ApiError(404,"user is not exists")
    }


    //password check 
    const passwordvalid=await user.IsPasswordCorrect(password)

    if(!passwordvalid){
        throw new ApiError(408,"password is incorrect")
    }



    //generate refreshtoken and access token
    const accesstoken=await user.generateaccesstoken()
    const refreshtoken=await user.generaterefreshtoken()
  
    
    user.refreshtoken = refreshtoken
    await user.save({validateBeforeSave:false})

    const LoggedInUser=await User.findById(user._id).select("-password -refreshtoken");
    
    const options ={
        httpOnly:true,
        secure:true
    }

    res.status(200)
    .cookie("accesstoken",accesstoken,options)
    .cookie("refreshtoken",refreshtoken,options)
    .json(
        new ApiResponce(200,"User Logged in Sucessfully !!",{
            user:LoggedInUser,accesstoken,refreshtoken
        })
    )
    

    


})

const LoggedoutUser=AsyncHandler(async(req,res)=>{
    //todos::- 
    //getting the id from the req.user 
    //using the middleware which is req.user

    //get the object from the req.user
    // remove the access token from it
    //remove refresh and access token ( by using clearcookies)
    //check the remove status is okay or not
    //logged out the user 


   await User.findByIdAndUpdate(
        req.user._id,
       
        {
            $unset:{
                refreshtoken:1
            }
        },
        {
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }



    res.status(200)
    .clearCookie("accesstoken",options)
    .clearCookie("refreshtoken",options)
    .json(
        new ApiResponce(200,"User Logged Out Sucessfully !! ",{})
    )


   
   

})

const RefreshToken=AsyncHandler(async (req,res)=>{
    //todos:- to verify user
    //check user cookies first 
    //verify them using jwt verify()
    //set cookies to new refresh token and access token 
    //save the new data in mongodb
    //send a responce with 200 code "user reset sucecssfully"


    const refreshtoken=req.cookies.refreshtoken || req.body.refreshtoken;

    if(!refreshtoken){
        throw new ApiError(400,"User cookies is not found")
    }

    const decodetoken=jwt.verify(refreshtoken,process.env.REFRESH_TOKEN_SECRET)

    if(!decodetoken){
        throw new ApiError(400,"Incorrect token by user")
    }

    const user= await User.findById(decodetoken?._id);

    if(!user){
        throw new ApiError(400,"User is not exist ")
    }
   
    const NewRefreshToken=await user.generaterefreshtoken()
    const NewAccesstoken=await user.generateaccesstoken()

    if(!NewRefreshToken && !NewAccesstoken){
        throw new ApiError(500,"Server Side Error failed to generate new tokens")
    }

    const insertnew = user.refreshtoken=NewRefreshToken


    await user.save({validateBeforeSave:false})

    const options={
        httpOnly:true,
        secure:true
    } 

    res.status(200)
    .cookie("accesstoken",NewAccesstoken,options)
    .cookie("refreshtoken",NewRefreshToken,options)
    .json(
        new ApiResponce(200,"User's Refresh token reset successfully!!",{
            accesstoken:NewAccesstoken, 
            refreshtoken:NewRefreshToken,
        })
    )


})

const ChangeCurrentPassword=AsyncHandler(async (req,res)=>{
    //todo's to change the password
    //get the old password and new password from the frontend 
    //get the user using cookies and jwt ( jsonwebtoken)
    //verify the old password if its not throw error
    //save the new password in mongodb 
    //send res with code 200 OK : json({"DONE"})

    const {password,newpassword}= req.body

    if(!password && !newpassword){
        throw new ApiError(404,"All Fields required")
    }

    const accesstoken=req.cookies.accesstoken

    if(!accesstoken){
        throw new ApiError(401,"User is unauthorized")
    }

    const decodetoken=await jwt.verify(accesstoken,process.env.ACCESS_TOKEN_SECRET)

    if(!decodetoken){
        throw new ApiError(400,"user is not valid")
    }

    const user=await User.findById(decodetoken._id)

    if(!user){
        throw new ApiError(500,"unable to find user")

    }
    const decodepassword=await user.IsPasswordCorrect(password)

    if(!decodepassword){
        throw new ApiError(400,"Old password is incorrect")

    }
    user.password=newpassword

    const saveuserpassword=await user.save({validateBeforeSave:false})
    if(!saveuserpassword){
        throw new ApiError(400,"Server Side Error While Saving Password")
    }

    res.status(200)
    .json(
        new ApiResponce(200,"Password Changed Succesfully!!",{})
    )




   
})

const GetCurrentUser=AsyncHandler((req,res)=>{
    const accesstoken=req.cookies.accesstoken

    if(!accesstoken){
        throw new ApiError(400,"User Is Not Logged IN")
    }

    res.status(200).json(

        new ApiResponce(200,"Suceess!!",req.user)
    )

})


const ChangeUsernameAndEmail=AsyncHandler(async (req,res)=>{
    //todo's for change the username and email
    //check the validation (at least one field is reauired)
    //get the user id from req.user 
    // find the user in mongodb
    //check the old password is correct or not
    //update the email or password
    // save the updated data in mongodb
    // send res with status code 200 "OK"
    
    const {username,email}=req.body
    
    if(!(username|| email)){
        throw new ApiError(400,"username or email is required ")
    }

    const user=await User.findById(req.user._id)
    
    if(!user){
        throw new ApiError(400,"Login Session Expired")
    }

    if(username){
        user.username=username
    }
    if(email){
        user.email=email
    }
    
    await user.save({validateBeforeSave:false})

    res.status(200)
    .json(
        new ApiResponce(200,"credentials reset Sucessfully !!",{})
    )


})

const ChangeAvatar=AsyncHandler(async (req,res)=>{
    //todo's to change user avatar ( profile image) and coverimage
    //check at least one field is fiiled 
    //access the files using multer middlesware (req.files[0].avatar.path)
    //upload them on cloudinary
    //get the url from cloudinary 
    //find the user in the database using req.user._id
    //get the new url and overwrite in avatar and coverimage section 
    //send resspoce with status code 200 "Success!!"

    const avatar=req.file.path
   

    //check the validation of fields
    if(!avatar){
        throw new ApiError(400,"Avatar file is required !!")
    }
    
    //delete previous file on cloudinary
    await Destroyfileoncloudinary(req.cookies.coverimageurl)


    //upload on clodinary

    const avatarurl=await Uploadfileoncloudinary(avatar)
    
    if(!avatarurl){
        throw new ApiError(500,"Failed to upload Image in cloudinary")
    }

    await User.findByIdAndUpdate(
        req.user._id,
       
        {
            $set:{  
                avatar:avatarurl?.url,
            }
          
        },
        {
            new:true
        }
    )
    
    res.status(200)
    .cookie("avatarurl",avatarurl.public_id)
    .json(
        new ApiResponce(200,"Avatar Update Succesfully!!",{})
    )
    
})


const Changecoverimage=AsyncHandler(async(req,res)=>{
    const coverimage=req.file.path
    if(!coverimage){
        throw new ApiError(400,"Coverimage is required")
    }

    //delete the previous file
    console.log(req.cookies) 
   await Destroyfileoncloudinary(req.cookies.coverimageurl)
   
   //todo is pending 
   
   // //upload on cloudinary
   const coverimageurl=await Uploadfileoncloudinary(coverimage)


    
    
    if(!coverimageurl){
        throw new ApiError(500,"Failed to upload image on cloudinary")
    }

    const user=await User.findByIdAndUpdate(
        req.user._id,   
        {
            $set:{coverimage:coverimageurl.url}
        }
    )
    console.log(user.coverimage)

    res.status(200)
    .cookie("coverimageurl",coverimageurl.public_id)
    .json(
        new ApiResponce(200,"Cover Image Sucessfully updated !!",{})
    )
})


const GetUserData=AsyncHandler(async (req,res)=>{   
    const {username}=req.params
    console.log(req.params)
    // console.log(req.params)
    if(!username){
        throw new ApiError(400,"Username is required!!")
    }   


    //need to understand this concept
    const user = await User.aggregate([
            {
                $match:{
                    username
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
                $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"subscriber",
                    as:"subscribeto"

                }                                                                                     
            },
            {
                $addFields:{
                subscribercount:{
                    $size:"$subscribers"
                },
                subscribertocount:{
                    $size:"$subscribeto"
                },
                issubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullname:1,
                email:1,
                username:1,
                subscribercount:1,
                subscribertocount:1,
                isfollowed:1,
                avatar:1,
                createdAt:1



            }   
        }
    ]) 

   
    

    if(!user.length){
        throw new ApiError(400,"Invalid Username (Database)")
    }

    return res
    .status(200)
    .json(
        new ApiResponce(200,"Data Successfully Fetched!!",user[0])
    )

})


const GetUserWatchHistory=AsyncHandler(async (req,res)=>{
    // console.log(req.user)
    const user=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)   
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchhistory",
                foreignField:"_id",
                as:"Watchhistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        fullname:1 ,
                                        avatar:1,
                                    }
                                }
                            ]
                        }

                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
                
            }
        }
    ])

    return res.status(200)
    .json(
        new ApiResponce(200,"Watch History Fetched Successfully!!",user[0])
    )

})




export {Signupuser,Loginuser,LoggedoutUser,RefreshToken,ChangeCurrentPassword,GetCurrentUser,ChangeUsernameAndEmail,ChangeAvatar,Changecoverimage,GetUserData,GetUserWatchHistory}