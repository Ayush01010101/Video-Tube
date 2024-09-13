import { AsyncHandler } from "../utils/AsyncHandler.js";

const Usercontroller=AsyncHandler(async (req,res)=>{
    res.status(200).json({
        message:"OK"
    })
})


export {Usercontroller}