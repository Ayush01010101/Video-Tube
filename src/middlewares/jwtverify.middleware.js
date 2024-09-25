import jwt from 'jsonwebtoken'
import { AsyncHandler } from '../utils/AsyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/User.model.js'
const jwtverify=AsyncHandler(async (req,res,next)=>{
    try {
        const accesstoken=await req.cookies.accesstoken
    
        if(!accesstoken){
            new ApiError(401,"User Is Unauthorized")
        }
    
    
        const decodetoken=jwt.verify(accesstoken,process.env.ACCESS_TOKEN_SECRET)
        
        if(!decodetoken){
            new ApiError(501,"Something went wrong while decoding the token ")
        }
    
        const user=await User.findById(decodetoken._id).select("-password -refreshtoken")
        
        req.user=user
         
         next()
    } catch(error){
        new ApiError(501,error?.message||"Server side error (jwtverify)")
        next()
    }

})

export {jwtverify}

