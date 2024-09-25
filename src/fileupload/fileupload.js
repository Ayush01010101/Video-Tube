import fs from 'fs'
import { v2 as cloudinary } from 'cloudinary'


// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});


async function Uploadfileoncloudinary(localfile) {
    try {
        if (!localfile) return null
        const fileuploading = await cloudinary.uploader.upload(localfile, { resource_type: "auto" })

        //file sucessfully uploaded to the cloudinary


        fs.unlinkSync(localfile)


        return fileuploading

    } catch (error) {
        fs.unlinkSync(localfile)
        return null
    }
}

async function Destroyfileoncloudinary(public_id){
    try {
        if(!public_id){
           console.log("public id is required")
        }
        await cloudinary.uploader.destroy(public_id,{resource_type:'auto'}) 
        return "Successfully Deleted!!"
    } catch  {
        throw "error inside Destroyfile"
    }
    
}






export { Uploadfileoncloudinary, Destroyfileoncloudinary }