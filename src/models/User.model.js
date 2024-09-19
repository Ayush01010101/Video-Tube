import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const UserSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        index:true,
        lowercase :true,
        trim:true
    },
   
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase :true,
        trim:true
    },
    fullname:{
        type:String,
        required:true,
     
        lowercase :true,
        trim:true
    },
    watchhistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"video"
        }
    ],
    avatar:{
        type:String,
        required:true
    },
    coverimage:{
        type:String,
        
    },
    refreshtoken:{
        type:String
    },
    password:{
        type:String,
        required:true
    }
   


},{timestamps:true})


UserSchema.pre("save",async function (next){
    if(!this.isModified("password")) return next()
    
    this.password= await bcrypt.hash(this.password,10) 
    next()
})

UserSchema.methods.IsPasswordCorrect= async function (password){
    return await bcrypt.compare(password,this.password)
}


UserSchema.methods.generateaccesstoken= async function (){
    return await jwt.sign(
        {
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname

        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
            
        }
)
}

UserSchema.methods.generaterefreshtoken=async function (){
    return await jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const User=mongoose.model("User",UserSchema)
export {User}