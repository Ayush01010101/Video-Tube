//health chcekr of a program 
import { ApiResponce } from "../utils/ApiResponce.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";


const Healthcheck=AsyncHandler((res)=>{
    res.status(200)
    .json(
        {
            status:"Everything Is Okay !!"
        }
    )
})
 

export
{
    Healthcheck
}