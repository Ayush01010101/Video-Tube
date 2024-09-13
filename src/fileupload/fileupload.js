import fs from 'fs'
import {v2 as cloudinary} from 'cloudinary'


    // Configuration
        cloudinary.config({ 
            cloud_name:process.env.CLOUD_NAME,
            api_key:process.env.CLOUD_API_KEY,
            api_secret:process.env.CLOUD_API_SECRET
        });
        
    
    async function Uploadfileoncloudinary(localfile){
        try{  
            if(!localfile) return null  
            const fileuploading=await cloudinary.uploader.upload(localfile,{resource_type:"auto"})

            //file sucessfully uploaded to the cloudinary
            console.log("file uploaded sucessfully on cloud",fileuploading.url)
      

        }catch(error){
            await fs.unlink(localfile)
            return null
        }
    }

export {Uploadfileoncloudinary}